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

#define WLAN_SSID       "xxxxxxxx"
#define WLAN_PASS       "xxxxxxxx"

/************************* MQTT Setup *********************************/

#define MQTT_SERVER      "MosquittoIP"    // IP address for the MQTT Mosquitto Broker
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
Adafruit_MQTT_Publish status0 = Adafruit_MQTT_Publish(&mqtt, "/outlet/status/0/0"); //Plug 0
Adafruit_MQTT_Publish status1 = Adafruit_MQTT_Publish(&mqtt, "/outlet/status/0/1"); //Plug 1

// Setup a feed called 'outlet' for subscribing to changes.
Adafruit_MQTT_Subscribe onoff0 = Adafruit_MQTT_Subscribe(&mqtt, "/outlet/0/0");
Adafruit_MQTT_Subscribe onoff1 = Adafruit_MQTT_Subscribe(&mqtt, "/outlet/0/1");

//Prototype the function to connect to the MQTT Broker
void MQTT_connect();


void setup() {

  delay(10); //Loop delay

  //Setup GPIO Pins
  //Relay 0
  pinMode(12, OUTPUT); //Set up led to output on GPIO 12
  pinMode(5, INPUT); //this is verification that the output was picked.

  //Relay 1
  pinMode(14, OUTPUT);
  pinMode(4, INPUT); //verification of the OUTPUT

  //High on the relay is OFF
  digitalWrite(12,HIGH); //ensure it is off to start
  digitalWrite(14,HIGH);

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
  ArduinoOTA.setHostname("wifi-outlet-0");

  // No authentication by default
  //ArduinoOTA.setPassword((const char *)"123456");

  //Messages during the process; can't see them but left incase there 
  //are actions that I want to add during these moments...
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
  mqtt.subscribe(&onoff1);
}

uint32_t Relay0 = 1; //Fake default value; to ensure status sent on power up.
uint32_t oldRelay0 = Relay0; //Keep track of old state and only send on change.

uint32_t Relay1 = 1;
uint32_t oldRelay1 = Relay1; //Keep track of old state and only send on change.

//Sketch looping code.
void loop() {

  //OTA update handler
  ArduinoOTA.handle();
  
  // Ensure the connection to the MQTT server is alive (this will make the first
  // connection and automatically reconnect when disconnected).  See the MQTT_connect
  // function definition further below.
  MQTT_connect();

  // this is our 'wait for incoming subscription packets' busy subloop
  // try to spend your time here

  Relay0 = digitalRead(5);
  Relay1 = digitalRead(4);
  
  Adafruit_MQTT_Subscribe *subscription;
  while ((subscription = mqtt.readSubscription(500))) { //The timeout is effectively the loop time between read and writes.
    if (subscription == &onoff0) {
      String lastMessage0 = (char *)onoff0.lastread;
      if (lastMessage0 == "ON") {
        digitalWrite(12,LOW);
        if (Relay0 == digitalRead(5)) {//client trying to turn on/off something that is already on or off; so let them know it is on..or off..
          status0.publish("ON");
        }
      } else {
        digitalWrite(12,HIGH);
        if (Relay0 == digitalRead(5)) {//client trying to turn on/off something that is already on or off; so let them know it is on..or off..
          status0.publish("OFF");
        }
      }
    }
    if (subscription == &onoff1) {
      Serial.println((char *)onoff1.lastread);
      String lastMessage1 = (char *)onoff1.lastread;
      if (lastMessage1 == "ON") {
        digitalWrite(14,LOW);
        if (Relay1 == digitalRead(4)) {//client trying to turn on/off something that is already on or off; so let them know it is on..or off..
          status1.publish("ON");
        }
      } else {
        digitalWrite(14,HIGH);
        if (Relay1 == digitalRead(4)) {//client trying to turn on/off something that is already on or off; so let them know it is on..or off..
          status1.publish("OFF");
        }
      }
    }
  }

 
  if (Relay0 != oldRelay0) {  //did it change state?
    char charValue[10];
    if (!Relay0) {
      strcpy(charValue,"ON\0");
    } else {
      strcpy(charValue, "OFF\0");
    }
    
    if (! status0.publish(charValue)) {
      Serial.println(F("Failed"));
    } else {
      Serial.println(F("OK!")); //good send;
      oldRelay0 = Relay0; //update old state.
    }
  }

  
  if (Relay1 != oldRelay1) {  //did it change state?
    char charValue[10];
    if (!Relay1) {
      strcpy(charValue,"ON\0");
    } else {
      strcpy(charValue, "OFF\0");
    }
    
    if (! status1.publish(charValue)) {
      Serial.println(F("Failed"));
    } else {
      Serial.println(F("OK!")); //good send;
      oldRelay1 = Relay1; //update old state.
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
