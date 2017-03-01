/***************************************************

This file uses a ESP8266 to remotely control a 120VAC
power outlet via MQTT.  The Huzzah Feather will connect
via wifi and utilize a Mosquitto broker to receive
commands.  It will then turn on a twin relay bank
that will power the outlet plugs.

Included in this program is the AdafruitOTA to allow
updates to the firmware via wifi; this is useful since
the ESP8266 device in embedded in an electrical box.

However, with the OTA; the serial monitor will not 
operate properly; to utilize this you much reconnect
via USB.

The original code was from the ESP8266 example and the
OTA examples provided.

MQTT Messaging format:

From Meteor or IoT Server: /outlet/outlet#/plug# (ie. /outlet/0/0 or /outlet/0/1)
  This topic is what is subscribed to in this sketch.
  Each  Outlet will need to have a unique number.

  The message is a simple "ON" or "OFF"; this will
  turn on the GPIO to energize the relay or relays

From this device: /outlet/status/outlet#/plug#
  The IoT Meteor server is subscribed to the status
  topics for any device defined.  It will take the
  status of "ON" or "OFF" or value if it is a analog
  type signal.

The output GPIO pins for the relay are also wired to
input values to ensure that the GPIO is functioning
normally for feedback to the Meteor IoT server.

****************************************************/
#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>

#include "Adafruit_MQTT.h"
#include "Adafruit_MQTT_Client.h"

/************************* WiFi Access Point *********************************/

#define WLAN_SSID       "WifiSSID"
#define WLAN_PASS       "wifipassword"

/************************* MQTT Setup *********************************/

#define MQTT_SERVER      "192.168.1.3"    // IP address for the MQTT Mosquitto Broker
#define MQTT_SERVERPORT  1883             // use 8883 for SSL
#define MQTT_USERNAME    ""               // Username if setup on the broker.
#define MQTT_KEY         ""               // Key if setup on the broker

/******************** Wifi Client / MQTT Client Setup *****************/

// Create an ESP8266 WiFiClient class to connect to the MQTT server.
WiFiClient client;

// or... use WiFiFlientSecure for SSL
//WiFiClientSecure client;

// Setup the MQTT client class by passing in the WiFi client and MQTT server and login details.
Adafruit_MQTT_Client mqtt(&client, MQTT_SERVER, MQTT_SERVERPORT, MQTT_USERNAME, MQTT_KEY);

/****************************** Feeds ***************************************/

// Setup a feed called 'temperature' for publishing; not utilized in this Sketch.
//Adafruit_MQTT_Publish temperature = Adafruit_MQTT_Publish(&mqtt, "/temperature/0/0");

// Setup a feed called '/outlet/status/0/X' for publishing
Adafruit_MQTT_Publish status0 = Adafruit_MQTT_Publish(&mqtt, "/outlet/status/2/0"); //Plug 0

// Setup a feed called 'outlet' for subscribing to changes.
Adafruit_MQTT_Subscribe onoff0 = Adafruit_MQTT_Subscribe(&mqtt, "/outlet/2/0");

//Prototype the function to connect to the MQTT Broker
void MQTT_connect();

#define RELAY 12 //GPIO 12 is the relay output on the SONOFF
#define LED 13 //GPIO 13 is the LED on the SONOFF
#define BUTTON 0 //GPIO 0 is the push button on the SONOFF
#define PUSHED 0
#define NOT_PUSHED 1

void setup() {

  delay(10); //small start up delay

  //Setup GPIO Pins
  //Relay 0
  pinMode(RELAY, OUTPUT); //Set up relay to output on GPIO 12
  pinMode(LED, OUTPUT); //Turn on led for verification
  pinMode(BUTTON, INPUT); //use switch to override MQTT; but send a MQTT message.

  //High on the relay is ON ; High on LED is OFF
  digitalWrite(RELAY,LOW); //ensure it is off to start
  digitalWrite(LED,LOW); //Blink LED to prove it has started up ok.
  delay(500);
  digitalWrite(LED,HIGH);
  delay(500);
  digitalWrite(LED,LOW);
  delay(500);
  digitalWrite(LED,HIGH);

  // Connect to WiFi access point.
  WiFi.mode(WIFI_STA);
  WiFi.begin(WLAN_SSID, WLAN_PASS);
  while (WiFi.waitForConnectResult() != WL_CONNECTED) {
    delay(5000);
    ESP.restart();
  }

/* 
 *  Setup the ArduinoOTA update capability
 *  
 */
  // Port defaults to 8266
  // ArduinoOTA.setPort(8266);

  // Hostname defaults to esp8266-[ChipID]
  ArduinoOTA.setHostname("wifi-outlet-2");

  // No authentication by default
  //ArduinoOTA.setPassword((const char *)"123456");

  //Messages during the update process
  ArduinoOTA.onStart([]() {
    Serial.println("Start");
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("\nEnd");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
    else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
    else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
    else if (error == OTA_END_ERROR) Serial.println("End Failed");
  });
  ArduinoOTA.begin();


  // Setup MQTT subscription for onoff feed.
  mqtt.subscribe(&onoff0);
}


//Sketch looping code.
boolean isItOn = false;
void loop() {

  //OTA update handler
  ArduinoOTA.handle();
  
  // Ensure the connection to the MQTT server is alive (this will make the first
  // connection and automatically reconnect when disconnected).  See the MQTT_connect
  // function definition further below.
  MQTT_connect();

  // this is our 'wait for incoming subscription packets' busy subloop
  // try to spend your time here
  
  Adafruit_MQTT_Subscribe *subscription;
  while ((subscription = mqtt.readSubscription(500))) { //The timeout is effectively the loop time between read and writes.
    if (subscription == &onoff0) {
      String lastMessage0 = (char *)onoff0.lastread;
      if (lastMessage0 == "ON") {
        digitalWrite(RELAY,HIGH);
        digitalWrite(LED,LOW);
        status0.publish("ON");
        isItOn = true;
      } else {
        digitalWrite(RELAY,LOW);
        digitalWrite(LED,HIGH);
        status0.publish("OFF");
        isItOn = false;
      }
    }
  }

  //If the push button is used; toggle the light and send a MQTT so the monitor system is up to date.
  if (digitalRead(BUTTON) == PUSHED) {
    if (!isItOn) {
        digitalWrite(RELAY,HIGH);
        digitalWrite(LED,LOW);
        status0.publish("ON");
        isItOn = true;
    } else {
        digitalWrite(RELAY,LOW);
        digitalWrite(LED,HIGH);
        status0.publish("OFF");
        isItOn = false;
    }
  }

  
  // ping the server to keep the mqtt connection alive
  // NOT required if you are publishing once every KEEPALIVE seconds
  // Am not necessarily publishing each time since it is via the state..
  /* 
  if(! mqtt.ping()) {
    mqtt.disconnect();
  }
  */
}

// Function to connect and reconnect as necessary to the MQTT server.
// Should be called in the loop function and it will take care if connecting.
void MQTT_connect() {
  int8_t ret;

  // Stop if already connected.
  if (mqtt.connected()) {
    return;
  }

  Serial.print("Connecting to MQTT... ");

  uint8_t retries = 3;
  while ((ret = mqtt.connect()) != 0) { // connect will return 0 for connected
       mqtt.disconnect();
       delay(5000);  // wait 5 seconds
       retries--;
       if (retries == 0) {
         // basically die and wait for WDT to reset me
         while (1);
       }
  }
}
