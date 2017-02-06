import paho.mqtt.client as mqtt
import time
import random
import decimal

# The callback for when the client receives a CONNACK response from the server.
def on_connect(client, userdata, flags, rc):
	print("Connected with result code "+str(rc))

	# Subscribing in on_connect() means that if we lose the connection and
	# reconnect then subscriptions will be renewed.
	client.subscribe("/outlet/+/+")

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
	mqttElements = msg.topic.split("/");
	newTopic = "/outlet/status/"+mqttElements[2]+"/"+mqttElements[3]
	client.publish(newTopic,msg.payload)

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect("localhost", 1883, 60)

# Blocking call that processes network traffic, dispatches callbacks and
# handles reconnecting.
# Other loop*() functions are available that give a threaded interface and a
# manual interface.
#client.loop_forever()

client.loop_start()
temp = 12;
switchStatus = "OFF";

while True:
	if switchStatus is "OFF":
		switchStatus = "ON"
	else:
		switchStatus = "OFF"

	client.publish("/switch/status/0/0",switchStatus)
	tempMessage = "{0:.2f}".format(random.uniform(68,100))
	client.publish("/temperature/status/0/0",tempMessage)


	time.sleep(5)
