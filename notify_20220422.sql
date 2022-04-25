-- MySQL dump 10.13  Distrib 8.0.28, for Win64 (x86_64)
--
-- Host: 13.214.226.23    Database: notify
-- ------------------------------------------------------
-- Server version	8.0.28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `apps`
--

DROP TABLE IF EXISTS `apps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `apps` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(32) DEFAULT NULL,
  `description` varchar(128) DEFAULT NULL,
  `contact_email` varchar(128) DEFAULT NULL,
  `default_icon` varchar(255) DEFAULT NULL,
  `created_dt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_dt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `archived_dt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `apps_ibfk_1` (`user_id`),
  CONSTRAINT `apps_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `apps`
--

LOCK TABLES `apps` WRITE;
/*!40000 ALTER TABLE `apps` DISABLE KEYS */;
INSERT INTO `apps` VALUES (1,1,'easy-notify','super notification system','judy123@test.com','https://media-exp1.licdn.com/dms/image/C560BAQGioWrn1Pib-Q/company-logo_200_200/0/1588649799420?e=2147483647&v=beta&t=s1pR7nw3HwGYnT-cxC74jc3_HdJbK0OyAgHfIEdZzuo','2022-04-17 01:21:31','2022-04-17 01:21:31',NULL),(2,1,'SuperCool','Coooooooooooooool','judysocool@cool.com','https://media-exp1.licdn.com/dms/image/C560BAQGioWrn1Pib-Q/company-logo_200_200/0/1588649799420?e=2147483647&v=beta&t=s1pR7nw3HwGYnT-cxC74jc3_HdJbK0OyAgHfIEdZzuo','2022-04-18 17:28:19','2022-04-18 17:28:19',NULL),(3,1,'HelloWorld','An app introduct basic programming technics','helloworld@test.com','https://images.pexels.com/photos/954599/pexels-photo-954599.jpeg','2022-04-19 15:22:05','2022-04-19 15:22:05',NULL),(4,1,'Hello','An app introduct basic programming technics','judytest2@gmail.com','https://images.pexels.com/photos/128299/pexels-photo-128299.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1','2022-04-19 15:29:37','2022-04-20 01:54:27','2022-04-20 01:54:27'),(5,2,'Easy Notify','Test Notification System','easynotifyemail@test.com','https://media-exp1.licdn.com/dms/image/C560BAQGioWrn1Pib-Q/company-logo_200_200/0/1588649799420?e=2147483647&v=beta&t=s1pR7nw3HwGYnT-cxC74jc3_HdJbK0OyAgHfIEdZzuo','2022-04-22 06:27:50','2022-04-22 06:27:50',NULL),(6,2,'Super Cool','A Cool App','coolemai2@test.com','https://images.pexels.com/photos/128299/pexels-photo-128299.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1','2022-04-22 06:29:51','2022-04-22 06:29:51',NULL);
/*!40000 ALTER TABLE `apps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `channels`
--

DROP TABLE IF EXISTS `channels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `channels` (
  `id` char(21) NOT NULL,
  `app_id` bigint unsigned NOT NULL,
  `channel_key` char(36) DEFAULT NULL,
  `name` varchar(32) DEFAULT NULL,
  `public_key` varchar(255) DEFAULT NULL,
  `private_key` varchar(255) DEFAULT NULL,
  `key_expire_dt` datetime DEFAULT NULL,
  `created_dt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_dt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_dt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `channel_key_UNIQUE` (`channel_key`),
  KEY `channel_ibfk_1` (`app_id`),
  CONSTRAINT `channels_ibfk_1` FOREIGN KEY (`app_id`) REFERENCES `apps` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `channels`
--

LOCK TABLES `channels` WRITE;
/*!40000 ALTER TABLE `channels` DISABLE KEYS */;
INSERT INTO `channels` VALUES ('1tAVl2nz-FrYHduCLwlHL',2,'99fe2d4e-c3d6-412a-b4b6-97ff0eb091b7','testchannel','BKcH2FUokkGITuqtKI1R3RO67oSF9diFRKxVEqD4L8INGoLuRd1QEkpH7i_7qekOGaoCLNXp53T99C1_cPrXVZo','NLmNR1jUsVOlVypHN6Hywzboc3KSnb3dBW_HSESCYoU',NULL,'2022-04-18 17:30:30','2022-04-18 17:30:30',NULL),('4Nrcgx-Bu1MgI8RKjnsJB',5,'4da9c17c-ac84-4b80-8457-53bbcac27eb7','Production','BFO5rmvZAd2JIYxQqftTDmNt0oxQ7Q4MgwtcEL9tk7RaY-Nrl80UTl5lZ_aCPMo24bjeQQLD4fLeNNgY5bSK2q4','mnLS7OdRl0QhUj9kEWyssUpNcQ-p8TkfYF5zfWB6d9I',NULL,'2022-04-22 06:28:18','2022-04-22 06:28:18',NULL),('8-xTETQ03aLe0ZzS6hC9P',1,'b80df534-7fde-4d7c-b13f-1ff1c92ae439','testchannel','BLjMSdYFoPqcUZ571gWrJeUVMLUn4ykjsGhR2A1ghU50ugBaALWNqIqz5TMH9dU3CL538Kgld_QnZgT5IdoXJd8','HMbSnyiGuwui6u8UF1eERZtYHYcJGNUxVxMn9Db4Hf4',NULL,'2022-04-19 01:42:30','2022-04-20 02:54:13','2022-04-20 02:54:13'),('9_Ij-KwUKNkVK5oQFy4zN',5,'c2fcf069-a749-4dcb-bad4-c80fd500c100','Test Env','BDEa16puiI1cQcy42Q5aGFhqEbT6PZJz6J23BHTnDg1vfu9NoejfEVRoWchk7kL5Uv6bS8cjOq00B1fioEpCLXg','Elrt0d-g29hgpXkXaXar1L4c1x3t27xjCtsjWbkWCy8',NULL,'2022-04-22 06:28:28','2022-04-22 06:28:28',NULL),('blvJhyfPrShrtAcu5Isio',1,'cb5b94d8-f6f3-4d8a-a67f-33da1477b685','Easy-Channel','BLHRYP8zslKyvguHxy0ySMu5ndZsFjoFsz1zV1BWVnbPniclZAHp24Lhah4zyOQekfb36EMMTbPggPzqbclRK0I','K8Hf8-RA1cB1k8K6S_obcfRD5YPb4Tb8di9FRHblMvk',NULL,'2022-04-18 13:01:31','2022-04-18 13:01:31',NULL),('gORGnpk4wlIubiZO926L7',3,'f934536c-30ba-4678-b977-c9ec2d4cc7b2','Development','BP7rZJ-thfG4JhvpWKKJwZ6GMewR2oJ5ejr5jZa8jl4CxJHQJXjveA6_xPqZrE3xlrbncukX367DaXGjB6JYtiA','7y8eve_EOo8YS1c0NCg9pfEZ3Kv7U5v6qthD76rbz1A',NULL,'2022-04-20 02:55:47','2022-04-20 02:55:47',NULL),('RYqZinZKGsuycFmHHaSEl',1,'1080f66a-0de7-4141-affe-3883f9721300','Test Channel','BDI7Az4VFpcfffsQsaVrHNDDzH6Khf7qfVBhxYLzUKLrmaxuFvt9rbCYKCrapll4HLt0imlxcRfPQjfJCWxbyMI','DtW2dH2IgBZ3r_dY0VwxXzp6QEaQ65Ot5hYO2bmOghM',NULL,'2022-04-20 02:45:13','2022-04-20 02:53:01','2022-04-20 02:53:01'),('UvKQt1DimA_JXuqar0cnU',6,'b64af61e-769a-422d-9c6d-f86e7b29e076','Production','BLSW3id6O8tIMllTUm-okUoggeWQ4ZYC4DhflQbHWOfPFjaEnXylvR7Dl8kNVxgnmvp6TqPpmr0QkJWLYf5kea4','nA0T-pRcOqlzRGDaOsORw6FZ9Un2RUEgBV-0EOdqnUQ',NULL,'2022-04-22 06:30:13','2022-04-22 06:30:13',NULL),('VyptWVqkw2h1ynOeWlTTv',3,'d6506b24-a5a2-4f36-b376-294b7b6b9704','Production','BLDT7inbUZwMIiPqB2w3nzL1t3gdEnuOmejUPlbLfw55ufMbwtSjPzGRkPpuIdDjRjwh66B8nFs2gCj6Xj_klqo','21VoZjIbEqS6PMrEdl45LUXkWEzAotDteFQIYmzznz0',NULL,'2022-04-19 17:23:42','2022-04-19 17:23:42',NULL),('yr_LJuTRfsvkrlGJ7WYy5',6,'cfa11660-7ec0-4012-9f9b-367d22b3279e','Test Env','BARVUMK6vD6d9cchnMVN8gX9cUhKbtMQiJk0sqhIdlT2fW7jHrVUjiKkvaPy19gD4m3M_XaFbN9kUl1cyhMIOJs','x7LvhJN-_-hjA-SmMNcDaai7YTWA63y3JqkIjYn1Ubw',NULL,'2022-04-22 06:30:04','2022-04-22 06:30:04',NULL);
/*!40000 ALTER TABLE `channels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` char(24) NOT NULL,
  `channel_id` char(21) DEFAULT NULL,
  `name` varchar(64) DEFAULT NULL,
  `type` enum('websocket','webpush') DEFAULT NULL,
  `scheduled_dt` datetime DEFAULT NULL,
  `status` tinyint unsigned DEFAULT '0',
  `targets_num` int DEFAULT '0',
  `sent_num` int DEFAULT '0',
  `received_num` int unsigned DEFAULT '0',
  `created_dt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_dt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `channel_id` (`channel_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES ('625dac3783ebd08de0ace147','blvJhyfPrShrtAcu5Isio','Welcome','websocket',NULL,3,0,0,0,'2022-04-18 18:21:43','2022-04-22 06:38:34'),('625dac5d83ebd08de0ace14a','blvJhyfPrShrtAcu5Isio','Welcome','websocket',NULL,3,0,0,0,'2022-04-18 18:22:22','2022-04-22 06:38:34'),('625dade96fea001059e800a0','blvJhyfPrShrtAcu5Isio','Welcome','websocket',NULL,3,0,0,0,'2022-04-18 18:28:58','2022-04-22 06:38:34'),('625dadfc6fea001059e800a3','blvJhyfPrShrtAcu5Isio','Valentine\'s Day','webpush',NULL,1,0,0,0,'2022-04-18 18:29:17','2022-04-22 06:38:32'),('625daf136fea001059e800a5','blvJhyfPrShrtAcu5Isio','Valentine\'s Day','webpush',NULL,1,0,0,0,'2022-04-18 18:33:56','2022-04-22 06:38:33'),('625dafc5c84a6c3847f8362a','blvJhyfPrShrtAcu5Isio','Valentine\'s Day','webpush',NULL,2,0,0,0,'2022-04-18 18:36:54','2022-04-22 06:38:33'),('625db0d50742b674ab7ba0e1','blvJhyfPrShrtAcu5Isio','Welcome','webpush',NULL,3,0,0,1,'2022-04-18 18:41:26','2022-04-22 06:38:37'),('625db0f40742b674ab7ba0e3','blvJhyfPrShrtAcu5Isio','Welcome','webpush','2022-04-18 18:42:00',3,0,0,1,'2022-04-18 18:41:57','2022-04-22 06:38:37'),('625db13f0742b674ab7ba0e5','blvJhyfPrShrtAcu5Isio','Campaign1','webpush','2022-04-18 18:43:00',3,0,0,1,'2022-04-18 18:43:11','2022-04-22 06:38:37'),('625e07436eafba7a0204f35e','blvJhyfPrShrtAcu5Isio','Campaign2','websocket',NULL,3,0,0,0,'2022-04-19 00:50:12','2022-04-22 06:38:37'),('625e07606eafba7a0204f360','blvJhyfPrShrtAcu5Isio','Campaign2','webpush',NULL,1,0,0,0,'2022-04-19 00:50:40','2022-04-22 06:38:36'),('625e09ae1977c7b5fb5f6d56','blvJhyfPrShrtAcu5Isio','Campaign1','webpush',NULL,3,0,0,1,'2022-04-19 01:00:30','2022-04-22 06:38:36'),('625e09f21977c7b5fb5f6d58','blvJhyfPrShrtAcu5Isio','Campaign1','websocket',NULL,3,0,0,0,'2022-04-19 01:01:38','2022-04-22 06:38:36'),('625e0a111977c7b5fb5f6d5a','blvJhyfPrShrtAcu5Isio','Campaign1','webpush','2022-04-19 01:05:00',3,0,0,1,'2022-04-19 01:02:09','2022-04-22 06:38:36'),('625e11fcde6cc6ef0f98a25d','blvJhyfPrShrtAcu5Isio','Campaign1','webpush',NULL,3,0,0,11,'2022-04-19 01:35:57','2022-04-22 06:38:35'),('625e128ce7a7a9775650db64','blvJhyfPrShrtAcu5Isio','Campaign1','websocket',NULL,3,0,0,11,'2022-04-19 01:38:20','2022-04-22 06:38:35'),('625e12aee7a7a9775650db67','blvJhyfPrShrtAcu5Isio','Campaign1','websocket',NULL,3,0,0,0,'2022-04-19 01:38:54','2022-04-22 06:38:34'),('625e1367de6cc6ef0f98a260','blvJhyfPrShrtAcu5Isio','Campaign1','webpush','2022-04-07 01:43:00',3,750,0,680,'2022-04-19 01:41:59','2022-04-22 06:41:25'),('62624c8777a59899dc6c9113','9_Ij-KwUKNkVK5oQFy4zN','Welcome','webpush','2022-04-09 08:00:00',3,810,0,800,'2022-04-22 06:34:46','2022-04-22 06:41:23'),('62624ca877a59899dc6c9115','9_Ij-KwUKNkVK5oQFy4zN','Welcome','webpush','2022-04-12 15:15:00',3,750,0,680,'2022-04-22 06:35:19','2022-04-22 06:41:24'),('62624cf377a59899dc6c9117','9_Ij-KwUKNkVK5oQFy4zN','Valentine\'s Day','webpush','2022-04-15 15:21:00',3,810,0,680,'2022-04-22 06:36:34','2022-04-22 06:41:24'),('62624d2477a59899dc6c9119','9_Ij-KwUKNkVK5oQFy4zN','Campaign1','webpush','2022-04-18 15:21:00',3,750,0,800,'2022-04-22 06:37:22','2022-04-22 06:41:24'),('62624d2a77a59899dc6c911b','9_Ij-KwUKNkVK5oQFy4zN','Campaign1','websocket','2022-04-19 15:21:00',3,810,0,800,'2022-04-22 06:37:29','2022-04-22 06:41:25');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `plan_id` int unsigned NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `total` int unsigned DEFAULT NULL,
  `created_dt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_dt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_table_ibfk_1` (`user_id`),
  KEY `orders_ibfk_2_idx` (`plan_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=322224937904 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (31748607650,1,1,'2022-04-17','2022-05-17',0,'2022-04-17 01:21:01','2022-04-22 05:55:05'),(322224937903,2,1,'2022-04-22','2022-05-22',0,'2022-04-22 06:14:52','2022-04-22 06:14:52');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plans` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(16) DEFAULT NULL,
  `description` varchar(64) DEFAULT NULL,
  `price_m` int unsigned DEFAULT NULL,
  `notification_limit` int unsigned DEFAULT NULL,
  `subscription_limit` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plans`
--

LOCK TABLES `plans` WRITE;
/*!40000 ALTER TABLE `plans` DISABLE KEYS */;
INSERT INTO `plans` VALUES (1,'Trial','Start For Free!',0,10000,1000),(2,'Foundation','Fundamentals to help startups scale',500,50000,5000),(3,'Growth','Advanced features to drive conversions',750,100000,10000),(4,'Scale','Ultimate control and support for businesses',1200,200000,2000);
/*!40000 ALTER TABLE `plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `id` char(21) NOT NULL,
  `channel_id` char(21) DEFAULT NULL,
  `endpoint` varchar(512) DEFAULT NULL,
  `keys` varchar(255) DEFAULT NULL,
  `expire_dt` datetime DEFAULT NULL,
  `client_tag` varchar(128) DEFAULT NULL,
  `status` tinyint unsigned DEFAULT '0',
  `created_dt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_dt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `endpoint_UNIQUE` (`endpoint`),
  KEY `subscription_ibfk_1` (`channel_id`),
  CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
INSERT INTO `subscriptions` VALUES ('62_mth_-3YE2QsCNSPreY','blvJhyfPrShrtAcu5Isio','https://fcm.googleapis.com/fcm/send/cyz9NG-WqkY:APA91bH1eXG8lZwVKTqmrnpwFsXvxNUWjplMCm4O_qDH8K9DDvrq5jsL0jDe3NfEGK4IBIJ0LVD8-8ZRbMbJ5EpXxj8rmEkmiqXUbI0z5fZ3n_Tfjf3PikJ6XzOR8Nmigd6ovzeBoDzJ','{\"p256dh\":\"BLyv8_fgRgKo8uTpD3n0ggwhQJslHivIq8XTsqUFTruJoaqOR1-Jff9_0zjyqDlK4bRMgf77aVpvjYd-jDIpgSY\",\"auth\":\"k2o0TFBERzMETstxX0na3w\"}',NULL,NULL,1,'2022-04-19 01:35:27','2022-04-19 01:35:27'),('hZJsAOlwAASUOwdlM4e-t','blvJhyfPrShrtAcu5Isio','https://fcm.googleapis.com/fcm/send/ddgYfwVi4NQ:APA91bGFdCOjE9WNw202o-_AjSql3U21eN35GrRLT8O7QywGssUvayiXSEc9MUHgIGPr95N0YSkwBdqao9-0IyDjlUtNeT7BYG_AKCK2PaHNuKjAy4xTVYEPnRDianSQUUghZetW6kDK','{\"p256dh\":\"BGSUS5G8aURDb-NN_btBoIyzysBbG5Ri-HVZaDhpkhPLjvdxTEjtchROD3ouPRdOJnVI4NLCxNs7tUhz6IODNTY\",\"auth\":\"JV2fkMRAzdk4ZfjEcrS8Zw\"}',NULL,NULL,1,'2022-04-19 01:35:11','2022-04-19 01:35:11'),('Lnf4Zx3LVaBu_MY0mIiaS','blvJhyfPrShrtAcu5Isio','https://wns2-sg2p.notify.windows.com/w/?token=BQYAAAApYEvfXubzarzohXlgoKMqxzFOLo3zJXA%2fkjZpyKqtEPl9nq9R%2fzUz0Oqz1fyB6Ra9LviFfadDvDS6hqetsgcTZbFXe7OiOFt9lbOTtXc1sBWrqkkrmqfyOgne0kocxl0%2fz9Ep%2fXDQBZ6D7xera2hTLoEob7ERX2xoJvBRYMdwtMGBvPpiUCUEzulS%2bkd2Lv5OpBL7dQiD93nLqHAicYfOuCaWag9byKNpVsL7j%2buPrEYDt4GGz7dpG7HWEN2Vztsl%2bjmTw8fFdgz8PgzmkYb1m4gAGDtSjq9qs6kQ7o5IvtTxmUMTFGFDBuFQov%2bOLjMlXV%2b1r%2bmwPq9K6qH3YxD7','{\"p256dh\":\"BBOsT0mvXxmwH8IhjF2N6Nj5cm3-00EwXggHL0y6SC7KHYwWBgNb3beWGuYlrIwH-JL2KHLHRXxARUZ_H_O-Xfk\",\"auth\":\"PbsEJlPH7K5iUwqAm8Hrww\"}',NULL,NULL,1,'2022-04-19 01:35:00','2022-04-19 01:35:01'),('lW0O8dU2MU_nCyyKdN2sY','blvJhyfPrShrtAcu5Isio','https://fcm.googleapis.com/fcm/send/daOQHHC78Ro:APA91bHuaXXHsH47lx_KToZeLTyfm0ChW3kei-tqzR6VbYZK_Gllbg3tPpqOajJIKKwWSaYOmWC41aoAMDCJMZrxVVg5jY-e3eRG8DlpP3L73Y1rQW3Xbn72CjNETSzyWWeMqqjxET17','{\"p256dh\":\"BC70lzkj8J4PJDZka1qCGUuegfbtJKK23FsFa2j4_4-2TFD8qDlR1Q3ZZR0UmygBoZUgoU8elqe2-Aq8AQx6fPM\",\"auth\":\"MJzYsRV8wGc_-GcpIQrajQ\"}',NULL,NULL,0,'2022-04-19 01:35:27','2022-04-19 01:35:27'),('pfvQ_La1sS_T1si_mXHT4','blvJhyfPrShrtAcu5Isio','https://wns2-sg2p.notify.windows.com/w/?token=BQYAAAC8AqUYMNERVlwY4jL%2fcZlOFyTvL8v7WoBP6Wya5kh9ETwJbIhWD3i0zNSpAyr0cJCPNmOniRvc4jC0P0Xgn7L9sGLHc31Idw7x7srn4Cj5tazsHCTrmvWy98g%2fmnz%2fGRxvT0OKPw%2fEd3CBKnPPF6JfqsPXhegmP7XfhPj44xCbi%2fUPfZ%2bhLblXNExANZTYH%2bcSnbA6LEFXxpo%2fBfCtsyvHLbLfT1PEmrmWiZLk8hxNGcZIQTFkyyeXYbFcObdyu%2fOnkRSsQLmVOPjgVjsm%2fiDvDYEDavGyy4mLASlhpgnKNe4mve4nNoO5wmm13EC%2fuXg%3d','{\"p256dh\":\"BCemoNbCjHdqcFdWz_aUOZTsGpNilxWI9EKyYeGLNrnYjFvNPGwGefvyjcgkZoNnoKi1EhCeAm0v-6sQ2Ihq_IY\",\"auth\":\"-4Pnzg1PDzmQR2RKsiWfKA\"}',NULL,NULL,1,'2022-04-19 01:55:59','2022-04-19 01:55:59'),('Qf90AlQc8zwcI3PvYOyia','blvJhyfPrShrtAcu5Isio','https://fcm.googleapis.com/fcm/send/dyHbjwlzolI:APA91bFsBzEL36_s-2aL3nwqmUtk2DhPPQR6Is-MOsE7DgBG3a_r1jtW4jcuhWkEQ4HajwgDWj6K7BphYQ3hzufK-k-o3tWchf_Dx3M8fdwdZPPISiGke7hEmq2LsUBboy4PTWKVSZzF','{\"p256dh\":\"BHBhE36qifHgXiP2mkXraktUP1qianypvsBN80ItpkW2LjblaqKujGQO8M_oHM8jIg-bp5D-gFiI0Fb-gtrUEa4\",\"auth\":\"EPiixMzE0jRQlROm-JkfHA\"}',NULL,NULL,1,'2022-04-18 18:24:46','2022-04-18 18:24:47'),('RJksopY5KOxsXRfNXYiSb','blvJhyfPrShrtAcu5Isio','https://fcm.googleapis.com/fcm/send/fP5d1oey3js:APA91bEKv4Lb8AVPD2zhCrGht-8Ms2Ku2qHq-eFr5k4FFpasQ0eu3GY3_HPgvzLDWlVNFukaxsSEJ3-sQloGRjznY9TBccF4qK4MQBwTquVfi6xrnG1z6jyXiEXjkkEwjDEpfkGUxJvH','{\"p256dh\":\"BIro45gXjVpShIMpGEJtv0oONxWjdy83nZiTN2AQqilgarOEd_joRoIlvKvwcD-wlGVlwZnIfgGzBULwBJSAwes\",\"auth\":\"c1OVFVU4OgiYi0PUZ-fZrQ\"}',NULL,NULL,0,'2022-04-19 01:35:27','2022-04-19 01:35:27'),('YEMf1Y93elsw414pPj-YW','blvJhyfPrShrtAcu5Isio','https://fcm.googleapis.com/fcm/send/diUMnkrwytA:APA91bE4PQ0pyufZjzwMy_el5fS6kE9q3T3aU2kkOXUXcr4kuDpkUdI8fr-wziZ7bOny0fWI5sOjLqAJRdn6KavO4ujmonv7eyYDG-gOkg-JjnbAs_a3wmVIZkCO-7j46uHEmcAZ4Yjf','{\"p256dh\":\"BFyEmwDbyKSrigRGNVDNCU8auh4IeA9hOuJVHetiKOmRWN8nyLQ24RofG0QN_Acc2N4EdHDf6R-6YhXnpIfjlUw\",\"auth\":\"Vp6bCTz1mdXH4Ht1AkLwPw\"}',NULL,NULL,1,'2022-04-19 01:34:58','2022-04-19 01:34:58'),('Zcr0xJfTF8_PdHm3UnIMW','blvJhyfPrShrtAcu5Isio','https://wns2-sg2p.notify.windows.com/w/?token=BQYAAADry8luzMGyJUKZrJt0PsIeUcmRm54Nko8gRjZ7QbCofZ%2ffokkVSy5pWn%2bopoDOE0YfjL99BuNeVheYUc%2bwpwaPiWLj7lNm6i%2fIlnoF3azB8AJLZgNtUftLlBtlQN7vdWPgFy%2bXf2e9B8XeQcoH1koveD2jEpyjKAgtEywgWu51%2bMeisqxMCaA1Gc9gjf15Y9zC40VGl15%2bjsffGt%2fpNtvP6NIQV%2f1RRj5ijs45%2b2y89uYvvX%2bETsCN0mlza869xM9p07E4jUpwmP4%2f2HMKzdgXqD%2fkomgctv9JBf3I3XGW0lFAi9vQm%2fx%2b%2bRPJp93VOVQKhPmaEf0Qqu8XEU7Zgp4T','{\"p256dh\":\"BL5OsdtYS3pjM_9tcFKqFM85CyCT8XxAwKkRuw-jDxDb8v-1Kv01-4jqy5XkO74Wb2eKx01vuQHZVC_MqQzEOrk\",\"auth\":\"EAdBTc0hO0lsn9Cy5yNrEg\"}',NULL,NULL,1,'2022-04-19 01:35:02','2022-04-19 01:35:03'),('zfOX3333IUQJqXWDW1I0G','blvJhyfPrShrtAcu5Isio','https://fcm.googleapis.com/fcm/send/dJq3zXs4-9U:APA91bEeIlHC23RjbYpWu5RTKIgF5O4eRQkKbSsIkU169o7Yoi6LNuUMRwKB5M--Q9gc5pL3f-bBwT5GHkVgb2WC2cxI7HrMzdGHzdov5Jv2x_LN5GiblZzNAXGJZftFjsOTRnn4cW0T','{\"p256dh\":\"BCyxvzf0We3JkpbfEvAAKo3ebmteTDzdskOw_j55jCxWk0sfNsDC3XUsxyQme6WIEaLFUIl_Ti8l8j82_KbYUpc\",\"auth\":\"4n2W_0GoJEDE-jovw8f-iA\"}',NULL,NULL,1,'2022-04-19 01:35:18','2022-04-19 01:35:19');
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(32) DEFAULT NULL,
  `email` varchar(128) NOT NULL,
  `password` char(60) NOT NULL,
  `plan_id` int unsigned DEFAULT '0',
  `start_date` date DEFAULT NULL,
  `expire_date` date DEFAULT NULL,
  `login_at` datetime DEFAULT NULL,
  `created_dt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_dt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `notification_num` int DEFAULT '0',
  `subscription_num` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'judy123','judy123@test.com','$2b$08$gOdXdIwzdsGlTKjgPscFju2j/YO3L6jmCf3nU/azq5FzkFwaTLRju',1,'2022-05-17','2022-05-17','2022-04-21 08:39:10','2022-04-17 01:19:06','2022-04-21 08:39:10',0,0),(2,'Judy','test1@gmail.com','$2b$08$IjYvSOv6yXDVFTjn7S.rjOaU6SxJ1ppsMcTD3kHtQk5iRgK7SPrXu',1,'2022-05-22','2022-05-22','2022-04-22 06:34:03','2022-04-22 05:52:55','2022-04-22 06:34:01',0,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-04-22 15:49:35
