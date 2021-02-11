# User Authentication Server

## When running the service on local development machines

### Register User

```
Endpoint - /
Method - POST
Body :-
{
    "email": String,
    "password": String,
    "firstName": String,
    "lastName": String
}
```


### Get User Profile

```
Endpoint - /me
Method - GET
Header :-
{
    "Authorization": "Bearer <accessToken>",
    "password": String,
    "firstName": String,
    "lastName": String
}
```


### Login User

```
Endpoint - /oauth/token
Method - POST
Body :-
{
    "grantType": "password"
    "email": String,
    "password": String
}
```


### Regenerate Access Token

```
Endpoint - /oauth/token
Method - POST
Body :-
{
    "grantType": "refreshToken"
    "refreshToken": String,
}
```


### Revoke Access Token

```
Endpoint - /oauth/revoke
Method - POST
Body :-
{
    "refreshToken": String
}
```