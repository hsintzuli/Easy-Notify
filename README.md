<a href="https://easynotify.site/">
    <img src="./docs/imgs/easy-notify.png" alt="Easy-Notify logo" align="right" height="60" style="background-color:white"/>
</a>

# Easy-Notify
Easy-Notify is a handy push notification service that enables developer to easily send and manage notifications via RESTful API and a management console. A Front-End NPM library, <a href="https://github.com/hsintzuli/EasyNotify-Client" target="_blank">EasyNotify-Client</a>, is provided for receiving the push notifications.  

--------------  

## Table of contents 
1. [External Links and Test Account](#external-links-and-test-account)
2. [Features](#features)
3. [Techniques](#techniques)
   - [Brief Architecture](#-brief-architecture)
   - [Architecture of Web-Push Notification and WebSocket Notification](#-architecture-of-web-push-notification-and-websocket-notification)
     - <a href="./docs/webpush-lambda.md/#scale-out-web-push-worker-by-using-aws-lambda" target="_blank">Scale Out Web-Push Worker by Using AWS Lambda</a>
     - Scalability of Socket.IO Server
   - <a href="./docs/notification-related_mechanism.md/" target="_blank">Mechanism of Sending and Tracking Notification</a>
     - <a href="./docs/notification-related_mechanism.md/#three-cases-of-notifications" target="_blank">Schedule Notification with Crontab and RabbitMQ</a>
     - <a href="./docs/notification-related_mechanism.md/#record-ack-response-on-redis-without-race-condition" target="_blank">Record the ACK Response on Redis [Avoid Race Condition]</a>  
4. [Demo](#demo)
   - [Home Page](#home-page)
   - [Subscribe to Your Channel on the Demo Website](#subscribe-to-your-channel-on-the-demo-website)
   - [Send A Web-Push Notification in Console](#send-a-web-push-notification-in-console)
   - [Key-Rotate](#key-rotate)
5. [Contact](#contact)

--------------  

## External Links and Test Account
### Links
- <a href="https://easynotify.site/" target="_blank">Easy-Notify Website</a> : Main website to sign up, manage Apps, and send notifications
- <a href="https://demo.easynotify.site/" target="_blank">Demo Website Website</a> : Website for tests by subscribing to your own channel
- <a href="https://github.com/hsintzuli/EasyNotify-Client" target="_blank">EasyNotify-Client GitHub</a> : Front-End library for receiving the notifications that are pushed to your channel
- <a href="https://www.npmjs.com/package/easy-notify-client" target="_blank">EasyNotify-Client NPM</a> : Link to the Front-End library in NPM
- <a href="https://app.swaggerhub.com/apis-docs/nnjkm076017/EasyNotify/1.0" target="_blank">Swagger API document</a> : API document about sending notification  


### Test Account

User        | Email | Password |
----------- | ----  | ---  |
visitor1    | visitor1@easynotify.com | visitor1 |
visitor2    | visitor2@easynotify.com | visitor2 |

_Note: After experiencing the service of Easy-Notify on Demo website with the test account, remember to click the unsubscribe button or you may keep receiving the test notifications from others._  

--------------  
## Features
- Send real-time/scheduled notifications by Web-Push or WebSocket
   - Web-Push : Need the authorization of your clients and let them receive messages even though your web app is not in the foreground. **Re-engage your clients with Web-Push notifications!**
   - WebSocket : Do not need the clients' authorization but only appears on your website. **Notify all the visitors landing on your website with upcoming activities by WebSocket!**
- Create channels for each App to further separate the environment
- Track the status and delivered rate of all the notifications
- Capture the tendency of the numbers of subscribers
- Send notifications with customize configuration
- Quickly get start with fully documented NPM library for Front-End and demo website
- Scalable architecture for users with thousands of subscribers 

--------------
## Techniques  
### 🔍 Brief Architecture
![Brief Architecture](./docs/imgs/architecture.png)  
<br />

### **🔍Architecture of Web-Push Notification and WebSocket Notification**
The architecture to scale out the handlers of Web-Push Notification and WebSocket Notification
![Architecture of Notification Handler](./docs/imgs/scaleout-architecture.png)    
  
#### **⭐ Documents about how this project implemented the two mechanisms**  

<a href="./docs/webpush-lambda.md/#scale-out-web-push-worker-by-using-aws-lambda" target="_blank">Scale Out Web-Push Worker by Using AWS Lambda</a>  

<a href="./docs/socketio-scaling.md/" target="_blank">Scalability of Socket.IO Server </a> 
<br/>

- ### **Mechanism of scheduled notification**  

   - <a href="./docs/notification-related_mechanism.md/#three-cases-of-notifications" target="_blank">Schedule Notification with Crontab and RabbitMQ</a>
   - <a href="./docs/notification-related_mechanism.md/#record-ack-response-on-redis-without-race-condition" target="_blank">Record the ACK Response on Redis Without Race Condition</a>  
--------------
## Demo  
- ### **Home Page**
Click Get Started to sign up a new account and follow the instruction in Demo page to quickly experience Easy-Notify
![Home Page](./docs/imgs/homepage.gif)
<br/>

- ### **Subscribe to Your Channel on the Demo Website**
Subscribe your own channel on Demo Website by the Channel ID and Channel Key
![Subscribe Channel](./docs/imgs/subscribe.gif)
<br/>

- ### **Send a Web-Push Notification in Console**
Send a Web-Push notification to the channel you subscribed in console and checkout the notification on the Demo Website 
![Send Notification](./docs/imgs/notification.gif)
<br/>

- ### **Key-Rotate**
In addition to create Apps and Channels, you can also rotate the Channel Key to enhance the security of your account
![Key Rotate](./docs/imgs/keyrotate.gif)
<br/>

---------------
## Contact
Email: hsintzuli719@gmail.com