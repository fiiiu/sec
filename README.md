# <h1 align="center"> S.E.C. </h1>

*Salary Expectations Checker*

## Set Up

build the `mossify-prod` branch of suave-geth and run a dev node
```
suave-geth --suave-dev
```

build contracts
```
forge build
```

fund second account
```
forge script scripts/FundAccount.s.sol:FundAccount --broadcast --rpc-url "http://localhost:8545" --private-key <prefunded_private_key>
```

deploy contract from default account
```
<path/to/suave/>suave-geth spell deploy SEC.sol:SEC
```

## Running from Console

create job from default account
```
<path/to/suave/>suave-geth spell conf-request <contract_address> 'createJob(uint)' '(1000)'
```

add candidate from default account--this works! (passing the --private-key param is optional)
```
<path/to/suave/>suave-geth spell conf-request --private-key <prefunded_private_key> 'newCandidate(uint, bytes memory)' '(0, 0xbaba)'
```

add candidate from second account--this fails!
```
<path/to/suave/>suave-geth spell conf-request --private-key <second_private_key> <contract_address> 'newCandidate(uint, bytes memory)' '(0, 0xdada)'
```

set min pay from second account--ok
```
<path/to/suave/>suave-geth spell conf-request --private-key <second_private_key> <contract_address> 'function setMinPay(uint, bytes memory, uint)' '(0,0xdada,2000)'
```

check match from second account--ok (no match in this example as 2000>1000)
```
<path/to/suave/>suave-geth spell conf-request --private-key <second_private_key> <contract_address> 'function isMatch(uint, bytes memory)' '(0,0xdada)'
```

## Running the Frontend

alternatively, you can run the frontend by seting up the webserver
```
bun dev
```

and visiting `localhost:5173` to interact with the app!
