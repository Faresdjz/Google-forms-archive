# Google forms archive
 A website designed to dynamically display, search, and interact with messages submitted via Google Forms.

## Overview
This project is a platform that brings together anonymous messages shared through a Google Form, letting users explore and interact with them in one place. It offers a solution to a long-standing issue with student-led anonymous forms, where access to messages solely depends on posts on social media. By creating an archive, this website offers easy access to all messages since the form’s inception, using data directly from Google Forms.

The site is designed to be user-friendly, allowing visitors to engage with the messages through likes, comments, sorting, and search options. This approach keeps the flow of messages continuous and accessible, giving users the freedom to explore without waiting for updates on other platforms.
## Table of content
- [Features](#features)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Learning Experience](#learning-experience)

## Features
- __Message Feed__: All messages are available for direct browsing.
  
- __Interactions__: Users can like and comment on each message.
- __Sorting and Search__:
     - __Sort by likes__: See the most popular messages.
     - __Sort by date__: Browse messages from newest to oldest.
- __Keyword search__: Find specific messages.

## Installation
To run this project locally, follow these steps:
1. ### __Clone the project__:
   ```
   git clone https://github.com/Faresdjz/Google-forms-archive.git
   ```
2. ### __Install Flask__:
   Ensure Flask is installed in your environment
   ```
   pip install flask
   ```
4. ### __Verify your api keys__:
   If you want to use it for personnal use, change the api key, service account and reference to your spreadsheet
   - __First__, go to ```https://console.cloud.google.com/```
   - Create an account and then a project for Google Sheets API
   - A tab "Credentials" should appear, click on it
   - You have two keys to get: API key and service account key. From here, it should be fairly straightfoward.
   - When the API key is generated, replace it on the ``script.js`` file:
     
     ```
     const apiKey = "AIzaSyBZPvSbSAH0IilJHoGnZupJ0XupwgN6rKo";
     ```
   - Lastly, when your service account is created, it should have downloaded a .json file. Replace mine (dulcet-fortress...json) with yours, than go to the .py file and change this line with the name of your service account .json file:
     
     ```
     SERVICE_ACCOUNT_FILE = 'dulcet-fortress-429800-t7-81cb0c48be67.json'
     ```
   - Almost done, you just need to change the reference of your google sheet.
   - Go to your google forms -> answers and then the option to open it in google sheets should appear
   - Take the url of your google sheets and extract the id. This example should make it clear:
     ```
     // https://docs.google.com/spreadsheets/d/14fJ9BUFKBT2Jmj3yn52LfB3fJ4WLuQVPpshgm1lOnv8/edit?resourcekey=&gid=1925173698#gid=1925173698
     const sheetId = "14fJ9BUFKBT2Jmj3yn52LfB3fJ4WLuQVPpshgm1lOnv8";
     ```
   - Last step, change the name of the sheet to the name you assigned (just like excel, the name of the sheet should be at the bottom of the page)
     ```
     // Change 'Réponses au formulaire 1' with your sheet's name
     const range = "'Réponses au formulaire 1'!A6:E200000";
     ```
   - >⚠️ Don't forget to invite your service account into your google sheet, and give it permission to read and write.
     
3. ### __Run the application__:
   Run the python file first, then the html and it should work

## Project Structure
- __Python (Flask)__ ``main.py``: Used for building the backend server and handling requests.
- __JavaScript__ ``script.js``: For front-end interactivity, including functions for liking, commenting, and sorting messages.
- __HTML/CSS__ ``index.html``: Provides the basic layout and styling of the website.
- __Google Sheet API__: Allows direct access to Google Sheet data, enabling real-time updates of new messages.

## Screenshots
1. ### Home Feed:
   
![image](https://github.com/user-attachments/assets/1be3eaba-d32e-4299-8cf5-0fef8c9d9f49)

> Displays a continuous feed of anonymous messages. Users can like, comment, and explore without restrictions.

2. ### Sorting Options:
   
![image](https://github.com/user-attachments/assets/d61bdebd-bccd-4397-8603-571fda060c1f)

> Shows how users can sort messages by date or popularity to customize their browsing experience.

3. ### Search Bar:
   
![image](https://github.com/user-attachments/assets/d9bf22d6-7efa-47f0-b443-fd8420b0ba62)

> Demonstrates the search functionality, allowing users to quickly find specific topics or keywords.

4. ### Message Interaction:

![image](https://github.com/user-attachments/assets/41ee53d4-d1e1-4eb7-94b8-d5f5f0f168d8)

> An example of the like and comment functionality, encouraging engagement on individual posts.

# Learning Experience
This project served as my introduction to JavaScript, which I learned by coding this site. Combining Flask on the backend with JavaScript for client-side interactivity, this project helped me understand how to build a functional web application that integrates with external APIs. It also offered hands-on experience with managing user interactions, data display, and creating a seamless user experience across the site.
