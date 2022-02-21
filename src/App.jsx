import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
//ethers helps our frontend talk to contract
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const TWITTER_HANDLE = 'kkamalva';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = "0x14F309a46E3c7c6720421554719E65554095e29F";

const App = () => {

  //state variable to store user's public wallet
  const [currentAccount, setCurrentAccount] = useState("");
  const [isAvailable, setAvailable] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isMining, setMining] = useState(false);

  const checkIfWalletIsConnected = async () => {
    //access to window.ethereum
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    //check if authorized to access user's wallet
    const accounts = await ethereum.request({method: 'eth_accounts'});

    //if user has multiple authorized accounts, we use the first one if it's there
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account)
      setupEventListener();
    } else {
      console.log("No authorized account found")
    }

  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      
      //if no metamask wallet is found
      if (!ethereum) {
        alert("Get MetaMask");
        return; //breaks from method
      }

      //requesting access to the account
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      //printing public address
      console.log("Connected", accounts[0]);
      console.log(accounts.length());
      setCurrentAccount(accounts[0]);




    } catch (error) {
      console.log(error)
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi,signer);

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        setAvailable(true);

        console.log("Setup event listener!")
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNFT = async () => {

    try {
      const { ethereum } = window;

      if (ethereum) {
        //provider is used to talk to ethereum nodes that Metamaks provides to send and receive data from deployed contract
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        
        //creates connection to contract
        //always need contract address, abi file, and signer to connect
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        setAvailable(false);
        setLoading(true);
       

        console.log("Opening wallet to pay gas fees...")
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setMining(true);
        console.log("Mining...")
        
        await nftTxn.wait()

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        setMining(false);
        setLoading(false);
        setAvailable(true);
        
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick = {connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  //runs function when page loads
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])


//Conditional render since we don't want to show Connect button when already connected
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Mint Your Own NFT</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>

          
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button onClick={askContractToMintNFT} className="cta-button connect-wallet-button">
              Mint NFT
            </button>
          )}
        </div>

        {isLoading && (
            <div className = "loading"> </div>
        )}

        {isMining && (
            <div className = "sub-text2">Mining Block... </div>
        )}        
        

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
          
        </div>
      </div>
    </div>
  );
};

export default App;