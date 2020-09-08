const express = require('express');
const fetch = require('node-fetch');
const redis = require('redis');
const data = require('./fakedata');
const {performance}=require('perf_hooks');
const Timer=require('time-counter');
const { time } = require('console');
const log=console.log.bind(console);


const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient(REDIS_PORT);

const app = express();
var counter = 0;

function cacheProductInfo(req,res,next){
    const {id}=req.params;
    client.get(id,(err,data)=>{
        if(err) throw err;
        if(data!==null){
           res.send(setProductInfo(id,data));
        }
        else
        {
            next();
        }
    })
}

let requests = 0;
let comparedid=0;
// let timer=performance.nodeTiming;
let timer=new Timer();
app.get('/products/:id', async (req, res) => {
    requests++;
    const { id } = req.params;
    
    if(requests==1){
       timer.start();
    }
    if(id!=comparedid){
       requests=0;
    }


    if(requests>=5 && comparedid==id && timer.getTime()<='2:00' ||timer.getTime()>'2:00'){
        console.log('getting data from cache');
        client.get(id,(err,val)=>{
           res.send(val);
        });
    }
    else
    {
        const product = await data.products.find(x => x._id === id);
        const tojson=await JSON.stringify(product);
        client.set(id,tojson);
        comparedid=id;
        res.send(product);
    }
  
    //console.log(timer.getTime());
    timer.on('change',log);
    //console.log(timer.nodeStart)
    

    //console.log(comparedid)
   
   
    console.log(requests);
    //res.send(product);

     
    // getRepos
});


app.listen(5000, (req, res) => { 
    counter++;
    console.log(`Server started at port ${PORT}`);
    console.log(`There are ${counter} connections`);
    // res.end(); 
});