Setps To Follow
===================
1- npm init -y

SettingUp Protractor
-------------
1-  $ npm install -g protractor
2-  webdriver-manager update
3- webdriver-manager start 
The above should start test server :  http://localhost:4444/wd/hub

SettingUp Karma
-------------
1-npm install -g karma-cli
2- npm install karma karma-jasmine jasmine-core karma-chrome-launcher --save-dev
3- npm install angular-mocks --save-dev
4- karma init
Answer normally yes and proceed ; make further changes in karma.config.js afterwards as needed.

SettingUp Gulp
-------------
In root folder make gulpfile.js