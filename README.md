# KChat frontend

Demo: http://kchat.nano-cloud.org/

Backend available here: https://github.com/avatsaev/kchat_backend

## Usage

Use Node 7.x with nvm

Grunt and Bower cli's must be installed in global with npm

Gems coffee, sass, and haml must be installed.

Frontend code is in **./app/** folder

### Installing


Install frontend dependencies:
```
bower install
```

Install backend dependencies:
```
npm install
```

Compile everything, start realtime compilation and live reload (see Gruntfile.coffee for more tasks):

```
grunt
```


Run:

```
npm start
```

Go to http://localhost:3003
