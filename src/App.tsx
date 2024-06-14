import { useState, useEffect } from 'react'
import Layout from './layout.tsx';
import './styles.css';
import { TransactionRequestSuave, getSuaveWallet, getSuaveProvider } from "@flashbots/suave-viem/chains/utils";
import { custom, http, Hex, createPublicClient, encodeFunctionData, hexToSignature, setSuaveTxHash, stringToHex } from '@flashbots/suave-viem';
import { localhost } from '@flashbots/suave-viem/chains'
import SEC from './contracts/out/SEC.sol/SEC.json';
import { parseEventLogs } from 'viem';
import { SuaveProvider, SuaveContract, SuaveWallet, BrowserProvider, ConfidentialComputeRecord, ConfidentialComputeRequest } from 'ethers-suave';
import { sendRawTransaction } from '@flashbots/suave-viem/actions';

const SEC_ADDRESS = "0xcb632cC0F166712f09107a7587485f980e524fF6";

const App = () => {
  const [mode, setMode] = useState("employer");
  const [wallet, setWallet] = useState<ReturnType<typeof getSuaveWallet>>();
  const [maxSalary, setMaxSalary] = useState<string>();
  const [employerJobID, employerSetJobID] = useState<string>();
  const [employerCandidateID, employerSetCandidateID] = useState<string>();
  const [candidateJobID, candidateSetJobID] = useState<string>();
  const [candidateCandidateID, candidateSetCandidateID] = useState<string>();
  const [minSalary, setMinSalary] = useState<string>();
  const [checkJobID, checkSetJobID] = useState<string>();
  const [checkCandidateID, checkSetCandidateID] = useState<string>();  
  const [createdJobID, setCreatedJobID] = useState<string>();
  const [candidateRegistered, setCandidateRegistered] = useState<string>();
  const [matchResult, setMatchResult] = useState<string>();
  const [expectationsSubmitted, setExpectationsSubmitted] = useState<string>();

  const suaveProvider = new SuaveProvider("http://localhost:8545");

  useEffect(() => {
      // console.log(suaveProvider.chain)
      const load = async () => {
      if ('ethereum' in window && !wallet) {
          console.log('ethereum is available')
          // request accounts from window.ethereum
          const eth = window.ethereum as any
          const accounts = await eth.request({ method: 'eth_requestAccounts' });
          console.log(accounts)
          const wallet = getSuaveWallet({
            transport: custom(eth),
            jsonRpcAccount: accounts[0],
          });
          console.log(wallet)
          setWallet(wallet)
          eth.on('accountsChanged', refreshWallet);
      } else {
          console.log('ethereum is not available')
      }
      }
      load()
  }, [wallet])

  const refreshWallet = async () => {
    const eth = window.ethereum as any
    const accounts = await eth.request({ method: 'eth_requestAccounts' })
    const wallet_ = getSuaveWallet({
      transport: custom(eth),
      jsonRpcAccount: accounts[0],
    });
    console.log('setting wallet');
    console.log(wallet_.account.address);
    setWallet(wallet_);
  }
  
  const signingCallback = async (_hash: string) => {
    const hexSig = await (window as any).ethereum.request({ method: 'eth_sign', params: [wallet?.account.address, _hash] })
    const sig = hexToSignature(hexSig)
    return { r: sig.r, s: sig.s, v: Number(sig.v) } as SigSplit
  }

  type SigSplit = {
    r: string;
    s: string;
    v: number;
  };

  const createJob = async () => {
    //suave-geth spell conf-request 0xd594760B2A36467ec7F0267382564772D7b0b73c 'createJob(uint)' '(1000)' 
    const nonce = await suaveProvider.getTransactionCount(wallet?.account.address);
    // console.log(nonce);
    const confidentialRecord = new ConfidentialComputeRecord({
        'nonce': nonce,
        'to': SEC_ADDRESS,
        'gas': '0x0f4240',
        'gasPrice': '0x9c9aca10',
        'value': '0x',
        'data':  encodeFunctionData({
            abi: SEC.abi,
            functionName: 'createJob',
            args: [10000n],
        }),
        'chainId': '0x1008C45',
    }, "0xb5feafbdd752ad52afb7e1bd2e40432a485bbb7f")
    
    const confidentialRequest = (await new ConfidentialComputeRequest(confidentialRecord, "0x").signWithAsyncCallback(signingCallback)).rlpEncode();
    // console.log(confidentialRequest);
    // return
    const res = await suaveProvider.send('eth_sendRawTransaction', [confidentialRequest]);
    console.log(res);
    const txReceipt = await suaveProvider.getTransactionReceipt(res);
    //console.log(txReceipt);
    //Fetch and decode the logs from the transaction receipt
    const logs = await parseEventLogs({ 
        abi: SEC.abi, 
        eventName: 'onchainJobCreated', 
        logs: txReceipt.logs,
    })
    //console.log('Decoded logs:', logs);
    const createdJobID = logs[0].args.createdJobID;
    console.log(createdJobID);
    setCreatedJobID(createdJobID.toString());       
  };


  const registerCandidate = async () => { 
    const nonce = await suaveProvider.getTransactionCount(wallet?.account.address);
    // console.log(nonce);
    const confidentialRecord = new ConfidentialComputeRecord({
        'nonce': nonce,
        'to': SEC_ADDRESS,
        'gas': '0x0f4240',
        'gasPrice': '0x9c9aca10',
        'value': '0x',
        'data': encodeFunctionData({
          abi: SEC.abi,
          functionName: 'newCandidate',
          args: [employerJobID, employerCandidateID],
        }),
        'chainId': '0x1008C45',
    }, "0xb5feafbdd752ad52afb7e1bd2e40432a485bbb7f")
    
    const confidentialRequest = (await new ConfidentialComputeRequest(confidentialRecord, "0x").signWithAsyncCallback(signingCallback)).rlpEncode();
    // console.log(confidentialRequest);
    // return
    const res = await suaveProvider.send('eth_sendRawTransaction', [confidentialRequest]);
    console.log(res);
    const txReceipt = await suaveProvider.getTransactionReceipt(res);
    //console.log(txReceipt);
    setCandidateRegistered(employerCandidateID);  
  };


  const submitExpectation = async () => {
    const nonce = await suaveProvider.getTransactionCount(wallet?.account.address);
    // console.log(nonce);
    const confidentialRecord = new ConfidentialComputeRecord({
        'nonce': nonce,
        'to': SEC_ADDRESS,
        'gas': '0x0f4240',
        'gasPrice': '0x9c9aca10',
        'value': '0x',
        'data': encodeFunctionData({
          abi: SEC.abi,
          functionName: 'setMinPay',
          args: [candidateJobID, candidateCandidateID, minSalary],
        }),
        'chainId': '0x1008C45',
    }, "0xb5feafbdd752ad52afb7e1bd2e40432a485bbb7f")
    
    const confidentialRequest = (await new ConfidentialComputeRequest(confidentialRecord, "0x").signWithAsyncCallback(signingCallback)).rlpEncode();
    // console.log(confidentialRequest);
    // return
    const res = await suaveProvider.send('eth_sendRawTransaction', [confidentialRequest]);
    console.log(res);
    const txReceipt = await suaveProvider.getTransactionReceipt(res);
    //console.log(txReceipt);
    setExpectationsSubmitted("Expectations submitted");
  };

  const checkMatch = async () => {    
    const nonce = await suaveProvider.getTransactionCount(wallet?.account.address);
    // console.log(nonce);
    const confidentialRecord = new ConfidentialComputeRecord({
        'nonce': nonce,
        'to': SEC_ADDRESS,
        'gas': '0x0f4240',
        'gasPrice': '0x9c9aca10',
        'value': '0x',
        data: encodeFunctionData({
            abi: SEC.abi,
            functionName: 'isMatch',
            args: [checkJobID, checkCandidateID],
        }),
        'chainId': '0x1008C45',
    }, "0xb5feafbdd752ad52afb7e1bd2e40432a485bbb7f")
    
    const confidentialRequest = (await new ConfidentialComputeRequest(confidentialRecord, "0x").signWithAsyncCallback(signingCallback)).rlpEncode();
    // console.log(confidentialRequest);
    // return
    const res = await suaveProvider.send('eth_sendRawTransaction', [confidentialRequest]);
    console.log(res);
    const txReceipt = await suaveProvider.getTransactionReceipt(res);
    //console.log(txReceipt);
    // Fetch and decode the logs from the transaction receipt
    const logs = await parseEventLogs({ 
        abi: SEC.abi, 
        eventName: 'onchainMatched', 
        logs: txReceipt.logs,
    })
    console.log('Decoded logs:', logs);
    const matchResult = logs[0].args.matched;
    console.log(matchResult);
    // setMatchResult(matchResult.toString());
    setMatchResult(matchResult?"Matched! :)":"Not matched :(");
  };


  return (
    <Layout>
    <div className="flex min-h-screen">
      <main className="flex-1 flex items-center justify-center">
        <section className="max-w-4xl mx-auto gap-8 py-12 px-6">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-black mb-2">Welcome to the S.E.C.</h1>
            <p className="text-2xl font-normal italic text-black mb-4">Salary Expectations Checker</p>
            <div className="mt-4 mb-4" />
            <div className="flex items-center justify-center gap-28">
              <button
                onClick={() => setMode("employer")}
                className={`px-6 py-3 rounded-full transition-colors ${
                  mode === "employer"
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-blue-200 hover:bg-blue-300 text-white"
                }`}
              >
                Employer
              </button>
              <button
                onClick={() => setMode("candidate")}
                className={`px-6 py-3 rounded-full transition-colors ${
                  mode === "candidate"
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-green-200 hover:bg-green-300 text-white"
                }`}
              >
                Candidate
              </button>
            </div>
            <div className="flex justify-between gap-10 mt-8 w-full">
              <div className="flex flex-col gap-4">
                
                <button
                  className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors min-w-48 ${
                    mode === "employer" ? "opacity-100" : "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={mode !== "employer"}
                  onClick={createJob}
                >
                  Create Job
                </button>

                <p></p>
                <div> Enter max salary: </div>
                <input className={"border border-gray-300 rounded w-24 place-self-end text-right"} type="text" value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)} placeholder='100000' disabled={mode !== "employer"}/>
                <p className="w-36 truncate">Created Job ID: <span className="font-bold">{createdJobID}</span></p>

              </div>


              <div className="flex flex-col gap-4">
                
                <button
                  className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors ${
                    mode === "employer" ? "opacity-100" : "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={mode !== "employer"}
                  onClick={registerCandidate}
                >
                  Register Candidate
                </button>

                <p></p>
                Enter job ID:
                <input className={"border border-gray-300 rounded w-24 place-self-end text-right"} type="text" value={employerJobID} onChange={(e) => employerSetJobID(e.target.value)} placeholder='2'/>
                
                <p></p>
                Enter candidate ID:
                <input className={"border border-gray-300 rounded w-24 place-self-end text-right"} type="text" value={employerCandidateID} onChange={(e) => employerSetCandidateID(e.target.value)} placeholder='0xbaba'/>

                <div className="w-48">Registered candidate: <p className="font-bold text-right">{candidateRegistered}</p></div>
                
              </div>
              <div className="flex flex-col gap-4">

                <button
                  className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors ${
                    mode === "candidate" ? "opacity-100" : "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={mode !== "candidate"}
                  onClick={submitExpectation}
                >
                  Submit Expectation
                </button>

                <p></p>
                Enter job ID:
                <input className={"border border-gray-300 rounded w-24 place-self-end text-right"} type="text" value={candidateJobID} onChange={(e) => candidateSetJobID(e.target.value)} placeholder='2'/>
                
                <p></p>
                Enter candidate ID:
                <input className={"border border-gray-300 rounded w-24 place-self-end text-right"} type="text" value={candidateCandidateID} onChange={(e) => candidateSetCandidateID(e.target.value)} placeholder='0xbaba'/>

                
                <p></p>
                Enter min salary:
                <input className={"border border-gray-300 rounded w-24 place-self-end text-right"} type="text" value={minSalary} onChange={(e) => setMinSalary(e.target.value)} placeholder='120000'/>


                <div className="min-w-48 min-h-8 font-bold">{expectationsSubmitted}</div>

              </div>
            </div>
            <div>
                <div className="flex flex-row gap-4 py-20">
                <button
                className={"bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"}
                onClick={checkMatch}
                >
                Check Match!
                </button>

                <p></p>
                <div className="self-center">Enter job ID:</div>
                <input className={"border border-gray-300 rounded w-24 text-right"} type="text" value={checkJobID} onChange={(e) => checkSetJobID(e.target.value)} placeholder='2'/>
                
                <div className="self-center">Enter candidate ID:</div>
                <input className={"border border-gray-300 rounded w-24 text-right"} type="text" value={checkCandidateID} onChange={(e) => checkSetCandidateID(e.target.value)} placeholder='0xbaba'/>
                </div>

                </div>
                <div className="text-xl min-h-8 font-bold">{matchResult}</div>
            </div>

        </section>
      </main>
    </div>
    </Layout>
  );
};

export default App;