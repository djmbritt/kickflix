var et = require('extratorrentapi')

et.search('south park')
                .then((tor)=>{
                  console.log(tor);
                })
                .catch((err)=>{
                  console.error(err);
                })


// esaki ta esun cu mi ker usa
