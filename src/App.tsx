import { useState, useEffect } from 'react'
import Layout from './layout.tsx';
import './styles.css';
import { TransactionRequestSuave, getSuaveWallet, getSuaveProvider } from "@flashbots/suave-viem/chains/utils";
import { custom, http, Hex, stringToHex, encodeFunctionData } from '@flashbots/suave-viem';
import SEC from './contracts/out/SEC.sol/SEC.json';

const SECAddress = "0xcb632cC0F166712f09107a7587485f980e524fF6";

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

  const createJob = async () => {
    //suave-geth spell conf-request 0xd594760B2A36467ec7F0267382564772D7b0b73c 'createJob(uint)' '(1000)'
    const suaveTx: TransactionRequestSuave = {
        to: SECAddress,
        value: 0n,
        gasPrice: 10000000000n,
        gas: 100000n,
        type: "0x43",
        data: encodeFunctionData({
            abi: SEC.abi,
            functionName: 'createJob',
            args: [maxSalary],
        }),
        confidentialInputs: "0x",
        kettleAddress: "0xb5feafbdd752ad52afb7e1bd2e40432a485bbb7f",
      }
      wallet?.sendTransaction(suaveTx).then((tx: Hex) => {
        console.log(tx)
      })
  };

  const registerCandidate = () => {
    const suaveTx: TransactionRequestSuave = {
        to: SECAddress,
        value: 0n,
        gasPrice: 10000000000n,
        gas: 100000n,
        type: "0x43",
        data: encodeFunctionData({
            abi: SEC.abi,
            functionName: 'newCandidate',
            args: [employerJobID, employerCandidateID],
        }),//stringToHex(userInput || "0x"),
        confidentialInputs: "0x",
        kettleAddress: "0xb5feafbdd752ad52afb7e1bd2e40432a485bbb7f",
      }
      wallet?.sendTransaction(suaveTx).then((tx: Hex) => {
        console.log(tx)
      })
  };

  const submitExpectation = () => {
    console.log('yuah');
    // setMessage("Button was clicked!");
  };

  useEffect(() => {
    const suaveProvider = getSuaveProvider(http("https://localhost:8545"))
    console.log(suaveProvider.chain)
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
      } else {
        console.log('ethereum is not available')
      }
    }
    load()
  }, [wallet])



  return (
    <Layout>
    <div className="flex min-h-screen">
      <main className="flex-1 flex items-center justify-center">
        <section className="max-w-4xl mx-auto gap-8 py-12 px-6">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-black mb-2">Welcome to the S.E.C.</h1>
            <p className="text-2xl font-normal italic text-black mb-4">Salary Expectations Checker</p>
            <div className="mt-4 mb-4" />
            <div className="flex items-center justify-center gap-20">
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
                  className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors ${
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


              </div>
            </div>
            <div>
                <div className="flex flex-row gap-4 py-20">
                <button
                className={"bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"}
                onClick={submitExpectation}
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
            </div>

        </section>
      </main>
    </div>
    </Layout>
  );
};

export default App;