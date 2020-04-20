# Google Calender Integration
## Srajan Gupta
### Website Link
https://quotesnstories-task.herokuapp.com/
### Procedure
* Just visit the above link.
* You will be redirected to Google Authorization page.
* Authorize the app to access your Google calender.
* It will ask as the Website is not in the trusted list. Continue to the website. Trust It. There is no problem.
* You will see your calender events in json format.
### Background
* I have only used Node JS for development of this website. There is no frontend.
### APIs used
* Used Google Calender API
### Functions 
* init() function Calls the Authorise() function, which generates authorization URL by calling getAccessToken() function.
* init() function is already called at the begining of server.
* When the user opens the website, he is redirected to Authorization URL.
* After Authorization with the preferred Google Account, he is redirected to /run.
* /run contains the code appended in the website URL. Here, it generated the token code and stores it in Client Browser as cookie. Then the user is redirected to /ret.
* Credentials are set in /ret routea and listEvents function is called which returns the list of maximum 200 events as JSON file in frontend.
* If a user tries to open /ret directly and no cookies are set, he will see a page which prompts him to home page to set the Authorization and then view the list of events.