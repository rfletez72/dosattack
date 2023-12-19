require('./globalVars');

const secIncrement = 5; // 5 seconds from now
const secSlow = 5; // 5 seconds from now to keep alive the connection
const secDump = 60 * 3; // 60 Dump cache after = 60 seconds * 3 = 3 minutes
const maxCalls = 1;

function DumpCacheAttack1() {
  let myArray = [];
  for (const dr in global.cacheAttack1) {
    if (parseInt(Date.now() / 1000) > (global.cacheAttack1[dr].iat + secDump)) {
      myArray.push(dr);
    }
  }
  for (let i = 0; i < myArray.length; i++) {
    if (global.cacheAttack1[myArray[i]]) {
      delete global.cacheAttack1[myArray[i]];
    }
  }
}

function AttackAPI1(ipaddress) {  
  DumpCacheAttack1();  
  if (global.cacheAttack1[ipaddress]) {
    if (parseInt(Date.now() / 1000) < global.cacheAttack1[ipaddress].exp) {
      if (global.cacheAttack1[ipaddress].counter < maxCalls) {        
        global.cacheAttack1[ipaddress].counter++;        
        return false;
      } else {      
        // slow down the attack by increment seconds to respond        
        global.cacheAttack1[ipaddress].counter++;
        global.cacheAttack1[ipaddress].exp = parseInt(Date.now() / 1000) + secSlow;                
        //for example if ip reach 100 add to blacklist (remember within 5 seconds)
        if (global.cacheAttack1[ipaddress].counter == 100) {          
          if (!(global.blacklist[ipaddress])) {
            let cachedata = {
              ip: ipaddress,
              counter: 1
            };
            global.blacklist[ipaddress] = cachedata;
          }        
        }
        return true;
      }
    } else {
      global.cacheAttack1[ipaddress].counter = 1;
      global.cacheAttack1[ipaddress].exp = parseInt(Date.now() / 1000) + secIncrement;      
      return false;
    }
  } else {
    let cachedata = {      
      counter: 1,
      iat: parseInt(Date.now() / 1000),
      exp: parseInt(Date.now() / 1000) + secIncrement
    };
    global.cacheAttack1[ipaddress] = cachedata;    
    return false;
  }
}

module.exports = { AttackAPI1 };
