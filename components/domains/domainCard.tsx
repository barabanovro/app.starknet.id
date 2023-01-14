import React, { FunctionComponent } from "react";
import { ThreeDots } from "react-loader-spinner";
import styles from "../../styles/Home.module.css";
import { minifyDomain } from "../../utils/stringService";

type DomainCardProps = {
  domain: string;
  onClick: () => void;
  isAvailable?: boolean;
  isConnected?: boolean;
};

const DomainCard: FunctionComponent<DomainCardProps> = ({
  domain,
  onClick,
  isAvailable,
  isConnected,
}) => (
  <div className={styles.card} onClick={onClick}>
    <h2 className={styles.cardTitle}>{minifyDomain(domain)}.stark</h2>
    {isAvailable === undefined ? (
      <ThreeDots
        height="25"
        width="80"
        radius="9"
        color="#19AA6E"
        ariaLabel="three-dots-loading"
        visible={true}
      />
    ) : (
      <p className="text">
        {isConnected
          ? isAvailable
            ? "Available"
            : "Unavailable"
          : "Connect your wallet first"}
      </p>
    )}
  </div>
);

export default DomainCard;
