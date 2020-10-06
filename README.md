
# Authorization-api 🔐

Simple auth api which can be used to -

1. Register new users.
Path: `/auth/register`

2. Login.
Path: `/auth/login`

3. Verify whether logged in user is valid or not.
Path: `/auth/verify`
  

## Install Dependencies

```npm install```

  

## Pre-requisites

  

1. Connect to a local mongo DB on PORT : ``27017`` 
2. Or I have also integrated an atlas mongo DB with this application. Contact me & I will give you the access to that DB.

  

# Running the application

  

``npm start``

  

# Sample request bodies

1. Register new user 

   

     POST http://localhost:8080/auth/register
        
        {
        
        "name": "Amey Lokhande",
        
        "password": "first password",
        
        "email": "amylokh@mail.com",
        
        "phone": "9223189806"
        
        }

  

2. Login

     POST http://localhost:8080/auth/login

        {
        
        "username": "amylokh@gmail.com",
        
        "password": "first password"
        
        }

  

3. Verify whether the token is valid or not

     POST http://localhost:8080/auth/verify

        {
        
        "email": "amylokh@gmail.com"
        
        }
