import axios from "axios";

import config from "./config";
import HomePage from "@/components/HomePage";

    const fetchAboutUsData = async () => {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/home-page`,
          responseType: "json",
        });
         return  response.data;
     
    };
export default async function Campaign() {

 const homePageData = await fetchAboutUsData();




  return (
    <>

  <HomePage homePageData={homePageData} />
    </>
  );
}
