# Overview

# to do

- add unique code to verify user
- requireAuth done
- attractions done

- shop
    - setup db
    - setup shop main page
    - create shop route for items

- basket
    - setup db
    - setup basket main page
    - setup routes to add, edit, remove items in the basket

- tickets
    - setup db
    - diff ticket types
    - ticket purchasing
    
- other
    - subscriber status
    - discount codes & coupons

# Models

User {
    id
    firstname
    lastname
    password
    email
    type {unverified, user, subscriber, admin}
}

Attractions {

}

News {

}

Tickets {

}

Items {
    id
    title
    description
    price
}

BasketItems {

}

Orders {

}

OrderItems {

}

# Testing

## Auth

/register
```
curl -X POST 'http://localhost/register' -H "Content-Type: application/json" -d '{"username": "testuser", "password": "testpass", "email": "testuser@example.com"}'
```

/verify
```
curl http://localhost/verify/<USER_ID>
```

/login
```
curl -X POST http://localhost/login -H "Content-Type: application/json" -d '{"username": "testuser", "password": "testpass"}'
```

# Other

docker container prune
docker volume prune