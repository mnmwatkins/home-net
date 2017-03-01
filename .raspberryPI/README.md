This directory is a number of node.js programs for the RaspberryPI that will
monitor a GPIO ping and send a MQTT Message.

Both programs are the same, but monitor different switches at this point. These
could easily be combined into a overall monitor program the checks multiple
GPIO pins and send the appropriate message.

motion.js / switch.js - monitor GPIO and send MQTT message
mqtt-demo.js - montior broker and enable 1-8 relay swithes and respond.
