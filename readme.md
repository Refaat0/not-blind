# Not Blind
![NodeJS](https://img.shields.io/badge/node.js-6DA55F.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)
![Mocha](https://img.shields.io/badge/-mocha-%238D6748?style=for-the-badge&logo=mocha&logoColor=white)

> Not Blind is my journey to one million requests per second

## Table of Contents
1. [Table of Contents](#table-of-contents)
2. [About the Project](#About-The-Project)
   - [Under The Hood](#under-the-hood)
   - [Limitations](#limitations)
3. [Benchmarks](#Benchmakrs)
4. [API](#api)
5. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
6. [Usage](#usage)

## About The Project
The main purpose of this project is to learn about web scaling. My goal is to create a robust backend that can (hopefully) scale up to
one million requests per second. This project will have different iterations, with this being the first. I plan to scale up from 
Sqlite to PostgrSQL & Redis. I am sure that along the way I will find out about new technologies & techniques to optimize the way
this server handles requests. I will be sure to document these finding here in this repository, as well as some benchmarks using
autocannon & the Node.js fetch api.

### Under The Hood
Right now there is nothing too interesting happening. A basic Node.js/Express.js application binded to an instance of Sqlite3. The 
server is structured through the controller-service-repositotry design pattern, and middleware is being used for validation & 
error handling. There is also a custom Query Builder I wrote to help build dynamic queries based on request url parameters to filter 
the data. There is a lot more to be desired but the basic foundations are here to start optimizing for requests per second. More info about
the api can be found here.

### Limitations
The current iteration of this project is super slow because I am using synchronous libraries. Even though libraries like `node:sql` 
and `better-sqlite3` are super fast, they dont expose their api with asynchronous functions. This means that every function call to 
the database blocks the Node.js event loop. And because Node.js is single threaded, it will block other incoming requests, which will
slow everything down, and might even get some requests timed out giving us this horrible user experience!

It's also worth pointing out that I am using `LIMIT ? OFFSET ?` clauses to paginate. Offset works by scanning an `n` amount of rows & then 
dropping them once it reaches `n`. It basically has a time complexity of O(n). I wrote a quick script in Node.js to fetch every page with 128 rows. I think I introduced some overhead since the firefox dev tools gives me lower latency, however for the pupose of viewing the time
increase per request, this should be sufficient! 

<p align="center">
  <img src="./assets/offsetstart.png" />
</p>

<p align="center"><b>Starts off fast but gets slower because of O(n) time complexity</b></p>

<p align="center" width="50%" height="100">
  <img src="./assets/offsetend.png" />
</p>

## Benchmarks
I am going to be running my server using `pm2`'s cluster mode which will utilize all of my machines cores. I am also going to be using 
`autocannon` to find out how many concurrent connections & requests per second this server could handle before  I start having latency &
time-out issues. 

```bash
  pm2 start 
  autocannon -c number_of_connections -d duration_seconds -p http_pipeline -w workers https://www.server.xyz/api/ip
```

### GET: /api/ip 
The server can handle 1-3 connections at a time, with 2-3 connections being the best in terms of rqs & latency. Once we hit 4+ connections
we notice a pattern! We still have about the same rqs but the latency skyrockets to unbearable amounts. Total requests also stay the same.
The synchronous nature of this server could explain why this happens. Autocannon is bombarding our server with more requests that it can
handle.

><table>
>  <tr><th>Node Instances</th><th>Connections</th><th>Average RPS</th><th>Average Latency</th><th>Total Requests</th><th>Read</th></tr>
>  <tr><td>4</td>             <td>1</td>          <td>8.3</td>        <td>120ms</td>          <td>167</td>           <td>404 kb</td></tr>
>  <tr><td>4</td>             <td>2</td>          <td>15</td>         <td>122ms</td>          <td>325</td>           <td>786 kb</td></tr>
>  <tr><td>4</td>             <td>3</td>          <td>16</td>         <td>182ms</td>          <td>329</td>           <td>793 kb</td></tr>
>  <tr><td>4</td>             <td>4</td>          <td>16.55</td>      <td>239ms</td>          <td>335</td>           <td>805 kb</td></tr>
>  <tr><td>4</td>             <td>4</td>          <td>16.55</td>      <td>239ms</td>          <td>335</td>           <td>805 kb</td></tr>
>  <tr><td>4</td>             <td>8</td>          <td>15.5</td>       <td>498ms</td>          <td>324</td>           <td>796 kb</td></tr>
>  <tr><td>4</td>             <td>16</td>         <td>15</td>         <td>1041ms</td>         <td>315</td>           <td>727 kb</td></tr>
></table>

### GET: /api/ip?limit=128&page=rnd(0,7813)
This is a very short benchmark because the results are abysmal! This could be explained by both the servers synchronous nature, and the 
O(n) pagination implementation. I guess I should have payed attention in those algorithm classes ;p 

><table>
>  <tr><th>Node Instances</th><th>Connections</th><th>Average RPS</th><th>Average Latency</th><th>Total Requests</th><th>Read</th></tr>
>  <tr><td>4</td>             <td>1</td>          <td>0.15</td>        <td>6174ms</td>          <td>4</td>           <td>48kb</td></tr>
>  <tr><td>4</td>             <td>2</td>          <td>0.35</td>         <td>6922ms</td>          <td>9</td>          <td>113kb</td></tr>
></table>

### POST: /api/ip
Dont let these high RPS & low latency decieve you! Pay attention to the total requests & how much is actually written to the database. 
Sqlite3 has a very strict one writer at a time policy. Requests are trying to write to a database file that is already locked! No matter
how many connections we have, our current server can only keep up with around ~2000 of them! If you are curious as to why we have such 
high rqs, my educated guess is because I am catching database lock errors in the ip-address-repository and returning a non 2xx code to the
server, which I suppose is much faster than reading from a sync database file. So the server is getting resposes, just not the ones I
expect.

><table>
>  <tr><th>Node Instances</th><th>Connections</th><th>Average RPS</th><th>Average Latency</th><th>Total Requests</th><th>Writes</th></tr>
>  <tr><td>4</td>             <td>1</td>          <td>110</td>          <td>8.55ms</td>        <td>2k</td>       <td>2000</td></tr>
>  <tr><td>4</td>             <td>2</td>          <td>1526</td>         <td>0.7ms</td>         <td>29k</td>      <td>2306</td></tr>
>  <tr><td>4</td>             <td>3</td>          <td>2283</td>         <td>0.88ms</td>        <td>29k</td>      <td>2145</td></tr>
>  <tr><td>4</td>             <td>4</td>          <td>2272</td>         <td>1.25ms</td>        <td>45k</td>      <td>1979</td></tr>
>  <tr><td>4</td>             <td>8</td>          <td>3253</td>         <td>2.3ms</td>         <td>56k</td>      <td>1959</td></tr>
>  <tr><td>4</td>             <td>16</td>         <td>3631</td>         <td>0.88ms</td>        <td>65k</td>      <td>1964</td></tr>
></table>

## API
<details>
 <summary><code>GET</code> <code><b>/api/ip?{ipAddress}{country}{dateStart}{dateEnd}{page}{limit}</b></code> <code>Gets ip addresses w/ optional queries</code></summary>

##### Query
> | name      | type     | data type | default | description                                              |
> |-----------|----------|-----------|---------|----------------------------------------------------------|
> | ipAddress | Optional | string    | N/A     | Filters for the specified ip address                     |
> | country   | Optional | string    | N/A     | Filters for the specified country in ISO 3166 A-2 format |
> | dateStart | Optional | string    | N/A     | Filters for ip's created after the dateStart specified   |
> | dateEnd   | Optional | string    | N/A     | Filters for ip's created before the dateStart specified  |
> | Page      | Optional | string    | 1       | Page                                                     |
> | Limit     | Optional | string    | 8       | Row limit. One of 8, 16, 32, 64 or 128                   |

##### Responses
> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `application/json`                | `{pagination: totalPages, totalRows, currentPage, currentRow, links: {first, last, net, prev}, result: [{}]}`                                                                                                              |
> | `400`         | `application/json`                | `{"code":"400","message": '"ip_address" is not allowed' }`                      |
> | `400`         | `application/json`                | `{"code":"400","message": '"Country" is not allowed' }`                         |
> | `400`         | `application/json`                | `{"code":"400","message": '"date_start" is not allowed'}`                       |
> | `400`         | `application/json`                | `{"code":"400","message": '"dateEnd" is not allowed'}`                          |
> | `400`         | `application/json`                | `{"code":"400","message": '"ipAddress" must be a valid ip address of one of the following versions [ipv4] with a optional CIDR'}`                                                                                       |
> | `400`         | `application/json`                | `{"code":"400", "message":  '"country" must be in ISO 3166 A-2 format'}`        |
> | `400`         | `application/json`                | `{"code":"400", "message":  '"dateStart" must be in iso format'"}`              |
> | `400`         | `application/json`                | `{"code":"400", "message":  '"dateEnd" must be in iso format'"}`                |
> | `400`         | `application/json`                | `{"code":"400", "message":  '"page" must be a number'}`                         |
> | `400`         | `application/json`                | `{"code":"400", "message":  '"limit" must be a number'}`                        |


##### Example cURL
> ```javascript
>  curl -X GET http://127.0.0.1:3000/api/ip?dateStart=2025-01-01T00:00:00
> ```
</details>

<details>
 <summary><code>GET</code> <code><b>/api/ip/{id}</b></code> <code>Gets ip address from unique identifier</code></summary>

##### Parameters
> | name      | type     | data type | default | description                                              |
> |-----------|----------|-----------|---------|----------------------------------------------------------|
> | id        | Required | string    | N/A     | Unique identifier for an ip address                      |

##### Responses
> | http code     | content-type                      | response                                                                  |
> |---------------|-----------------------------------|---------------------------------------------------------------------------|
> | `200`         | `application/json`                | `{id:"8ed9825a0b6f9a03d797fb1695423298", ip_address:"117.237.13.206", country:"CN", created_at: "2025-01-01 00:00:44"}`                                                                                 |
> | `400`         | `application/json`                | `{"code": 400,"message": '"id" length must be 32 characters long' }`      |
> | `400`         | `application/json`                | `{"code": 400,"message": '"id" must only contain hexadecimal characters'}`|
> | `400`         | `application/json`                | `{"code": 400,"message": '"id" must only contain hexadecimal characters'}`|
> | `400`         | `application/json`                | `{"code": 400,"message": "Cannot find an IP Address with the ID 8ed9825a0b6f9a03d797fb169542329F" }`                                                                                              |

##### Example cURL
> ```javascript
>  curl -X GET http://127.0.0.1:3000/api/ip?/8ed9825a0b6f9a03d797fb1695423298
> ```
</details>

<details>
 <summary><code>POST</code> <code><b>/api/ip</b></code> <code>Logs an ip address to the database</code></summary>

##### Query
> | name      | type     | data type      | default | description |
> |-----------|----------|----------------|---------|-------------|
> | ipAddress | Required | Object (JSON)  | N/A     | N/A         |
> | country   | Required | Object (JSON)  | N/A     | N/A         |
> | dateStart | Required | Object (JSON)  | N/A     | N/A         |
> | dateEnd   | Optional | Object (JSON)  | N/A     | N/A         |

##### Responses
> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `application/json`                | `{"code": 200, "message": 'Persistance successful!'}`               |
> | `400`         | `application/json`                | `{"code":"400","message":"Bad Request"}`                            |
> | `400`         | `application/json`                | `{"code":"400","message": '"ip_address" is not allowed' }`                      |
> | `400`         | `application/json`                | `{"code":"400","message": '"Country" is not allowed' }`                         |
> | `400`         | `application/json`                | `{"code":"400","message": '"ipAddress" must be a valid ip address of one of the following versions [ipv4] with a optional CIDR'}`                                                                                       |
> | `400`         | `application/json`                | `{"code":"400", "message":  '"country" must be in ISO 3166 A-2 format'}`        |

##### Example cURL
> ```bash
>  curl -X POST http://127.0.0.1:3000/api/ip
>       -H "Content-Type: application/json" http://127.0.0.1:3000/api/ip 
>       -d { "ipAddress": "142.66.8.36", "country": "CA" }
> ```
</details>

## Getting Started
These instructions will help you get a copy of this project up & running on your machine.

### Prerequisites 
You **must** have [Node.js](https://nodejs.org/en/download), [Mocha](https://mochajs.org/getting-started/), and [Sqlite3](https://www.sqlite.org/download.html) installed on your system

Create & populate the .env file
```bash
refaat@xubuntu:~ nano /server .env
                 HOST=your_host_here
                 PORT=your_port_here
```

Create & poulate the sqlite database:
```bash
refaat@xubuntu:~ /not-blind/server/src/database sqlite3 development.db < migrations/01-create-database.sql
refaat@xubuntu:~ /not-blind/server/src/database sqlite3 development.db < migrations/01-insert-dumb-data.sql
```

> Note: database.js holds the path for development.db, production.db & testing.db

### Installation 
Clone the repository to your local machine:
```
refaat@xubuntu:~$ git clone https://github.com/Refaat0/notblind
```

Install dependancies:
```
refaat@xubuntu:~/notblind/server$ npm install
```

Run the tests:
```
refaat@xubuntu:~/notblind/server$ npm test
```

Run the program:
```
refaat@xubuntu:~/notblind/server$ node ./index.js
```

## Usage
cURL:
```bash
  curl -X GET http://127.0.0.1:3000/api/ip?dateStart=2025-01-01T00:00:00&dateEnd=2025-01-01T00:23:59&country=CA
```

Autocannon to test the server:
```bash
autocannon -m POST \
  -H "Content-Type: application/json" \
  -b '{"ipAddress: 68.144.229.248", "country": "CA"}' \
  http://127.0.0.1:3000/api/ip
  -c 1
  -d 20
```