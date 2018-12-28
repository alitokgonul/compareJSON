var glob = require("glob");
var fs = require("fs");
var equal = require('deep-equal');

let outgoingArr = [];
let signalsArr = [];
let mismatchedMWFs = [];
let itemsProcessed = 0;

// read the all .mwf files under worfklow file => workflow/*.json
glob("workflow/*.mwf", (err, files) => {
  if(err) {
    console.log("cannot read the folder, something goes wrong with glob", err);
  }
  files.forEach(file => {
    fs.readFile(file, 'utf8', (err, data)  => { // Read each file
      if(err) {
        console.log(`cannot read the file(${file}), something goes wrong with the file ${err}`);
      }
  	  // regular expression to find Xor
  	  var isXorExist = data, expr = /Exclusive_Databased_Gateway/;
  	  if(expr.test(isXorExist)){
    		dataJson = JSON.parse(data);
    		// take childShapes in JSON
    		childShapes = dataJson.workflow_contents.childShapes;
    			childShapes.map(el => {
            // check if the xor exist in the flow
    				if(el.stencil.id === "Exclusive_Databased_Gateway") {
              const outgoing = el.outgoing;
              const signals = JSON.parse(el.properties.signalcfg).signals;
              outgoingArr = [];
              signalsArr = [];
              // push all outgoing id to outgoingArr
              outgoing.map(resource => {
                outgoingArr.push(resource.resourceId);
              });
      				// push all signals id to signalsArr
              signals.map(signal => {
                signalsArr.push(signal.id);
              });
              // sort arrays in order to compare element one by one
              outgoingArr.sort();
              signalsArr.sort();
              // Compare outgoing  & signals id
              if(!equal(outgoingArr, signalsArr)){
                var fileAndResourceId = "fileName : " + file  + "Xor Name : " + el.properties.name;
                mismatchedMWFs.push(fileAndResourceId);
              }
    				}
    			});
    	  }
        itemsProcessed++;
        if(itemsProcessed === files.length){
            listMismatchFlows();
        }
      });
  });

});

var listMismatchFlows  = () => {
  mismatchedMWFs = removeDuplicates(mismatchedMWFs);
  mismatchedMWFs.map((el, index) => {
    console.log(`${index + 1}) ${el}`);
  });
}

function removeDuplicates(arr){
    let unique_array = []
    for(let i = 0;i < arr.length; i++){
        if(unique_array.indexOf(arr[i]) == -1){
            unique_array.push(arr[i])
        }
    }
    return unique_array
}
