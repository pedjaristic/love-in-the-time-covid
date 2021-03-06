import React from "react";
import { useLocalStorageState } from "../utils/usePersistentStorage";
import styled from "styled-components";

type RequestStatus = "notStarted" | "loading" | "success" | "failed";

/** 5 hours in milisecons */
const MaxCacheAge = 1.8e7;

/** Shows number of recovered cases */
export const RecoveredCount: React.FC = props => {
  const [status, setStatus] = React.useState<RequestStatus>("notStarted");
  const [recovered, setRecovered] = useLocalStorageState("recoveredCount");
  const [dataDate, setDataDate] = useLocalStorageState("recoveredDate");
  const [cacheDate, setCacheDate] = useLocalStorageState("cacheDateTime");

  React.useEffect(() => {
    setStatus("loading");

    // Check if cache exists, and if it is older than 5 hours.
    if (
      !cacheDate ||
      new Date().valueOf() - new Date(cacheDate).valueOf() > MaxCacheAge ||
      Number.isNaN(Number(recovered))
    ) {
      // If cache is older than 5 hours, fetch new data.
      fetch(".netlify/functions/covidCount")
        .then(response => response.json())
        .then(data => {
          setRecovered(String(data.recovered));
          setDataDate(new Date(data.date).toUTCString());
          setCacheDate(new Date().toUTCString());
          setStatus("success");
        })
        .catch(err => {
          console.error("Error:", err);
          setStatus("failed");
        });
    } else {
      // If cache is new enough, set the status as successful
      setStatus("success");
    }
  }, []);
  return (
    <div>
      {status === "loading" ? (
        "Loading data"
      ) : status === "success" ? (
        <div>
          Recovered cases:
          <br />
          <RecoveredNum>
            {new Intl.NumberFormat("en-US", { style: "decimal" }).format(
              Number(recovered)
            )}
          </RecoveredNum>
        </div>
      ) : status === "failed" ? (
        "Sorry, something went wrong"
      ) : (
        ":)"
      )}
    </div>
  );
};

const RecoveredNum = styled.span`
  font-size: 1.2rem;
`;
