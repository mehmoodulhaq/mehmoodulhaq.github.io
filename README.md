Setps  Followed In development branch:
------------
1- npm init -y

SettingUp Protractor
-------------
1-  $ npm install -g protractor
2-  webdriver-manager update
3- webdriver-manager start 
The above should start test server :  http://localhost:4444/wd/hub
4- npm install jasmine --save-dev
create :
protractor.config.js in root folder 
start :
5-open project in browser then 
6- protractor protractor.config.js 
or 
6- npm run e2e

SettingUp Karma
-------------
1-npm install -g karma-cli
2- npm install karma karma-jasmine jasmine-core karma-chrome-launcher --save-dev
3- npm install angular-mocks --save-dev
4- karma init
Answer normally yes and proceed ; make further changes in karma.config.js afterwards as needed.

----------

#### Gulp Tasks
1- gulp --- for development
2- gulp prod  --- for production build (This will make a doc folder inside project with minified code)
3- gulp test --- for test
4- gulp tdd --- for test driven development
#### State Management
I've developed my own **Redux**  service that also uses **thunk** strategy to manage the state of the app with async data.

#### LoalStorage
Redux Service has used localStorage to save its states when brower closed.

#### Sass
Used Sass for UI with various gulp tasks to extract out unused css from and css file, used gulp tasks for minification and corssbrowsers compatibality tools like sass preprocessors.

#### Nano
Used nano-scroll bar in cards to create crossbrowser custom scroll bar

#### Grid system
Used bootstrap grid system as a develpement tool to make application more responsive.

#### Unit tests
In progress

#### Link to app
https://whispering-reef-98882.herokuapp.com/#!/
