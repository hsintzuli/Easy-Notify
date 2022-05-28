## Mechanism of scheduled notification
<br/>

### **Three cases of notifications:**
<p align="center">
  <img src="./imgs/notification-flow.png" alt="Notification Flow Chart" width="700" />
</p>
<br/>
1. Real-time notifications:  
Directly put the notification into RabbitMQ Exchange and deliver to the Web-Push/WebSocket queue by routing key.
2. Notifications that is Scheduled in 6 hours:  
Put into RabbitMQ Delayed Message Exchange and transfer to RabbitMQ Exchange when the time is up
3. Notifications that is Scheduled Exceed 6 Hours from Now:  
Let a crontab worker examine whether there are notifications in the database that should be put into RabbitMQ Delayed Message.  

--------
<br/>

## Record ACK response on Redis without race condition
<br/>

### **Rotate two HashMaps on Redis to record the ack responses from subscribers:**
<p align="center">
  <img src="./imgs/ack-response.png" alt="./imgs/ack-response.png" width="700" />
</p>
<br/>

After a notification was sent via Easy-Notify, the EasyNotify-Client would make a request to Easy-Notify server as an ACK response to that notification. The numbers of the ACK responses would be recorded in MySQL, which enables users to track the delivered rate.

However, the ACK response would be a high-rate event and increase the write-load of MySQL. A Redis HashMap that can hold and aggregate the number is handy for this scenario. In addition, the rotation of two HashMaps every hour enable a crontab worker to update the numbers in Redis to MySQL in the background without worrying about Race Condition.