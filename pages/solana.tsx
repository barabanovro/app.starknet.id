import React, { useEffect, useState } from "react";
import styles from "../styles/solana.module.css";
import Image from "next/image";
import AffiliateImage from "../public/visuals/affiliate.webp";
import Button from "../components/UI/button";
import StarknetIcon from "../components/UI/iconsComponents/icons/starknetIcon";
import Wallets from "../components/UI/wallets";
import { useAccount } from "@starknet-react/core";
import ProgressBar from "../components/UI/progressBar";
// import EthLogo from "../public/visuals/ethLogo.svg";
import { NextPage } from "next";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

//todo: remove from visual ethLogo.svg
// todo: remove Solana button component

const Solana: NextPage = () => {
  const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false);
  const { address: starknetAddress } = useAccount();
  const { publicKey: solPublicKey, signMessage } = useWallet();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [snsDomains, setSnsDomain] = useState<string[]>([]);
  const [hasLoadedSolDomain, setHasLoadedSolDomain] = useState<boolean>(false);
  const [solSig, setSolSig] = useState<Uint8Array>();

  // todo: check that user has not already claimed the domain

  useEffect(() => {
    if (!starknetAddress) setCurrentStep(0);
    else if (starknetAddress && !solPublicKey) setCurrentStep(1);
    else if (starknetAddress && solPublicKey) setCurrentStep(2);
  }, [starknetAddress, solPublicKey]);

  console.log("publicKey", solPublicKey);
  console.log("starknetAddress", starknetAddress);

  // fetch sol domains from SNS api
  useEffect(() => {
    if (!solPublicKey) return;
    fetch(`https://sns-api.bonfida.com/owners/${solPublicKey}/domains`)
      .then((response) => response.json())
      .then((res) => {
        console.log("Success:", res);
        if (res?.success) setSnsDomain([...res?.result]);
        else setSnsDomain([]);
        setHasLoadedSolDomain(true);
      })
      .catch((error) => {
        console.log("An error occured", error);
        setSnsDomain([]);
        setHasLoadedSolDomain(true);
      });
  }, [solPublicKey]);

  const generateSignature = async (solDomain: string) => {
    if (!signMessage) return;
    console.log("generating domain for", solDomain);
    const maxValidity = parseInt(
      ((Date.now() + 60 * 60 * 1000) / 1000).toFixed(0)
    );
    const message = `${solPublicKey} allow claiming ${solDomain}.sol on starknet on ${starknetAddress} at max validity timestamp ${maxValidity}`;

    // encode message to Uint8Array
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(message);

    signMessage(uint8Array).then((sig) => {
      console.log("sig", sig);
      setSolSig(sig);
      generateStarkSig(solDomain, sig, maxValidity);
    });
  };

  const generateStarkSig = async (
    solDomain: string,
    solSig: Uint8Array,
    maxValidity: number
  ) => {
    const sigQuery = {
      source_domain: solDomain + ".sol",
      target_address: starknetAddress,
      source_signature: Array.from(solSig),
      max_validity: maxValidity,
    };
    const data = JSON.stringify(sigQuery);
    console.log("data", data);

    fetch(`http://0.0.0.0:8080/subdomains/generate_sol_sig`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    })
      .then((response) => response.json())
      .then((res) => {
        console.log("Success:", res);
      })
      .catch((error) => {
        console.log("An error occured", error);
      });
  };

  // const checkAndUpdateStepNumber = () => {
  // if (
  //   StarknetAddress &&
  //   connectedEthereumAddress &&
  //   selectDomain.length > 0
  // ) {
  //   setCurrentStep(3);
  // } else if (StarknetAddress && connectedEthereumAddress) {
  //   setCurrentStep(2);
  // } else if (!StarknetAddress) {
  //   setCurrentStep(1);
  // }
  // };

  // useEffect(() => {
  //   checkAndUpdateStepNumber();
  // }, [StarknetAddress, connectedEthereumAddress]);

  return (
    <div className={styles.screen}>
      <div className={styles.wrapperScreen}>
        <div className={styles.container}>
          {currentStep === 0 ? (
            <div className={styles.banner}>
              <Image
                src={AffiliateImage}
                alt="hey"
                priority
                className={styles.image}
              />
              <div className={styles.banner_content}>
                <div>
                  <span className="title mr-2">Get your .sol domain on </span>
                  <span className="title" style={{ color: "#19AA6E" }}>
                    Starknet
                  </span>
                </div>
                <p className="text-left">
                  Get your .sol domain on starknet. Connect, verify, and elevate
                  your digital identity with cross-chain domains !
                </p>
                <div className={styles.button_container}>
                  <Button onClick={() => setWalletModalOpen(true)}>
                    <div className="flex flex-row gap-4 justify-center items-center">
                      <StarknetIcon width="28" color="" />
                      <p>Connect your Starknet wallet</p>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          ) : currentStep === 1 ? (
            <div className={styles.banner}>
              <Image
                src={AffiliateImage}
                alt="hey"
                priority
                className={styles.image}
              />
              <div className={styles.banner_content}>
                <div>
                  <span className="title mr-2">Get your .sol domain on </span>
                  <span className="title" style={{ color: "#19AA6E" }}>
                    Starknet
                  </span>
                </div>
                <p className="text-left">
                  Get your .sol domain on starknet. Connect, verify, and elevate
                  your digital identity with cross-chain domains!
                </p>
                <div className={styles.button_container}>
                  <div className={styles.connectEthLayout}>
                    <WalletMultiButton />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.domainContainer}>
              <div className="flex flex-row justify-between	">
                <h1 className="title text-left">Domains to bridge</h1>
                <WalletMultiButton />
              </div>
              <div className={styles.domain_list}>
                {/* // todo: add skeleton if hasLoadedSolDomain is set to false */}
                {snsDomains.map((name, index) => {
                  return (
                    <div key={index} className={styles.domain_box}>
                      <p className={styles.domainName}>{name}.sol</p>
                      <div>
                        <Button onClick={() => generateSignature(name)}>
                          Allow on Solana
                        </Button>
                        {/* <Button onClick={() => generateStarkSig(name)}>
                          Test server
                        </Button> */}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className={styles.progress_bar_container}>
          <ProgressBar doneSteps={currentStep} totalSteps={3} />
        </div>
      </div>
      <Wallets
        closeWallet={() => setWalletModalOpen(false)}
        hasWallet={walletModalOpen}
      />
    </div>
  );
};

export default Solana;
