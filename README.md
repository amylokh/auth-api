
# Authorization-api 🔐

Simple auth api which can be used to -

1. Register new users.
Path: `/auth/register`

2. Login.
Path: `/auth/login`

3. Verify if the access token & refresh token are valid
Path: `/auth/verify`

4. Refresh the tokens
Path: `/auth/refresh`

5. Log out
Path: `/auth/logout`

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
        "email": "amylokh@gmail.com",
        "refreshToken": "issued refresh token"
        }
        And pass access token in Authorization header as `Bearer accesstoken`

4. Refresh tokens

     POST http://localhost:8080/auth/refresh

        {
        
        "refreshToken": "theIssuesRefreshToken"
        
        }

5. Log out

     POST http://localhost:8080/auth/logout

        {
        
        "refreshToken": "theIssuesRefreshToken"
        
        }