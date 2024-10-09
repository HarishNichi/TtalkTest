"use client";
import SearchList from "@/components/Card/searchList";
import CardIcon from "@/components/Card/icon";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { errorToastSettings, maxLimit } from "@/utils/constant";
import DashboardOrganization from "@/components/Icons/dashboardOrganization";
import DashboardConnections from "@/components/Icons/dashboardConnections";
import DashboardActiveConnection from "@/components/Icons/dashboardActiveConnections";
import DashboardDisabledConnections from "@/components/Icons/dashboardDisabledConnections";
import Transcribe from "@/components/Icons/transcribeDashboard";
import DashboardCall from "@/components/Icons/call";
import intl from "@/utils/locales/jp/jp.json";
import { useAppSelector } from "@/redux/hooks";
import api from "@/utils/api";
import { ToastContainer, toast } from "react-toastify";
import { addOrganization } from "@/redux/features/organization";
import { useAppDispatch } from "@/redux/hooks";
import { addEmployee } from "@/redux/features/employee";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import LineChart from "./components/graph";
const Dashboard = () => {
  const dispatch = useAppDispatch();
  const [searchResults, setSearchResults] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const auth = localStorage.getItem("accessToken");
  const isAuthenticated = auth ? true : false;
  const [organizationsData, setOrganizationsData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState({});
  const [graphData, setGraphData] = useState({});
  const [searchHeight, setSearchHeight] = useState(350);

  useEffect(() => {
    /* eslint-disable no-undef*/
    Promise.allSettled([fetchData(), fetchGraphData(), fetchCount()])
      .then((res) => {
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setSearchHeight(window.innerHeight - 425);
    };
    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Change the breakpoint as needed
    };
    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const UserData = useAppSelector((state) => state.userReducer.user);
  let Admin = false;
  if (isAuthenticated && Object.keys(UserData).length > 0) {
    const User = UserData ? JSON.parse(UserData) : "";
    const roles = User?.role ? JSON.parse(User.role) : [];
    Admin = roles ? roles.some((role) => role.toLowerCase() == "admin") : false;
  }

  /**
   * Fetches graph data from the server, and then updates the state.
   * The data includes the total number of calls, average calls per day,
   * a list of daily calls, the step size for the graph, and the maximum
   * number of calls per day.
   * @returns {Promise<void>}
   */
  const fetchGraphData = async () => {
    toast.dismiss();
    setLoading(true);
    try {
      const params = {
        params: {
          limit: maxLimit,
          offset: "null",
        },
      };
      const response = await api.get("others/graph", params);
      let data = response.data.data;
      let max = Math.max(...data.graph);
      let max2 = max == 0 ? 10 : max;
      let step = max > 10 ? Math.floor(max / 10) : 500;
      let graph = {
        total: data.total,
        avg: data.avg,
        graph: data.graph,
        step: step,
        max: max2,
      };
      setGraphData(graph);
    } finally {
      toast.dismiss();
    }
  };

  /**
   * Fetch the count of organizations, employees, simultaneous interpretation, and
   * transcription, as well as the number of logged in and logged out users.
   *
   * @returns {Promise<void>}
   */
  const fetchCount = async () => {
    setLoading(true);
    toast.dismiss();
    const params = {
      params: {
        limit: maxLimit,
        offset: "null",
      },
    };
    const response = await api.get("others/dashboard", params);
    let data = response.data.data.Item;
    let org = {
      orgCount: data.orgCount,
      licenseCount: data.empCount,
      totalSimultaneousInterpretation: data.simultaneousInterpretationCount,
      totalTranscribe: data.transcribeCount,
      numberOfLoggedInCount: data.loggedInCount,
      numberOfLoggedOutCount: data.loggedOutCount,
    };
    setCounter(org);
  };

  /**
   * Fetches data for the dashboard page. If the user is an admin, it will fetch
   * a list of organizations. If the user is not an admin, it will fetch a list of
   * employees. The data is then saved to the state, and the search results are
   * also updated.
   */
  const fetchData = async () => {
    toast.dismiss();
    setLoading(true);
    if (Admin) {
      let { data: response } = await api.post("organizations/projection", {});
      response = response.data.Items.map((org) => {
        return {
          key: org.id,
          id: org.id,
          companyName: org.name || "-",
          link: "/company/details",
        };
      });
      setOrganizationsData(response);
      setSearchResults(response);
    } else {
      try {
        let { data: response } = await api.post("employees/projection", {});
        response = response.data.Items.map((emp, index) => {
          return {
            key: index,
            id: emp.id,
            userName: emp.name,
            radioNumber: emp.pttNo,
            link: "/user-details",
          };
        });
        setEmployeeData(response);
        setSearchResults(response);
      } catch (error) {
        setLoading(false);
      }
    }
  };

  /**
   * Searches through the organizations or employee data based on the provided
   * inputValue and updates the searchResults state accordingly.
   *
   * If the inputValue is empty, the searchResults state is reset to the original
   * data.
   *
   * @param {string} inputValue - The search query to filter the data by.
   */
  function searchCompany(inputValue) {
    if (inputValue) {
      if (Admin) {
        // Filter organizationsData based on the inputValue
        const filteredResults = organizationsData.filter((org) => {
          // You might want to adjust this condition based on your search criteria
          return org.companyName
            .toLowerCase()
            .includes(inputValue.toLowerCase());
        });
        // Update the searchResults state
        setSearchResults(filteredResults);
      } else {
        // Perform a similar operation for non-admin users
        const filteredResults = employeeData.filter((user) => {
          // You might want to adjust this condition based on your search criteria
          return user.userName.toLowerCase().includes(inputValue.toLowerCase());
        });
        // Update the searchResults state
        setSearchResults(filteredResults);
      }
    } else {
      if (Admin) {
        setSearchResults(organizationsData);
      } else {
        setSearchResults(employeeData);
      }
    }
  }

  /**
   * Handles a link click event, dispatching the
   * addOrganization or addEmployee action depending
   * on the user type.
   *
   * @param {React.MouseEvent} event - The link click event.
   * @param {Object} clickedResult - The organization or employee
   *                                 object that was clicked.
   */
  const handleLinkClick = (event, clickedResult) => {
    if (Admin) {
      dispatch(addOrganization(clickedResult));
    } else {
      dispatch(addEmployee(clickedResult));
    }
  };

  return (
    <>
      {loading && <LoaderOverlay />}
      <ToastContainer />
      <div className="flex flex-col">
        {Admin && (
          <div className="grid grid-cols-2 xl:grid-cols-6 md:gap-2 mb-2 pb-2">
            <div className={`pr-2 pb-2 lg:p-0`}>
              <CardIcon
                title={intl.dashboard_card_number_of_companies_label}
                value={counter.orgCount || 0}
                borderVarient="border-[#39A1EA]"
                icon={<DashboardOrganization isMobile={isMobile} />}
              ></CardIcon>
            </div>
            <div className={`pl-2 pb-2 lg:p-0`}>
              <CardIcon
                title={intl.dashboard_card_number_of_connections_label}
                value={counter.licenseCount || 0}
                borderVarient="border-[#FEB558]"
                icon={<DashboardConnections isMobile={isMobile} />}
              ></CardIcon>
            </div>
            <div className={`pr-2 pt-2 pb-2 lg:p-0`}>
              <CardIcon
                title={intl.dashboard_card_active_connection_label}
                value={counter.numberOfLoggedInCount || 0}
                borderVarient="border-[#29AB91]"
                icon={<DashboardActiveConnection isMobile={isMobile} />}
              ></CardIcon>
            </div>
            <div className={`pl-2 pt-2 pb-2 lg:p-0`}>
              <CardIcon
                title={intl.dashboard_card_invalid_connection_label}
                value={counter.numberOfLoggedOutCount || 0}
                borderVarient="border-[#FF7555]"
                icon={<DashboardDisabledConnections isMobile={isMobile} />}
              ></CardIcon>
            </div>
            <div className={`pr-2 pt-2 pb-2 lg:p-0`}>
              <CardIcon
                title={intl.transcribe_count}
                value={counter.totalTranscribe || 0}
                borderVarient="border-[#E8C50D]"
                icon={<Transcribe isMobile={isMobile} />}
              ></CardIcon>
            </div>
            <div className={`pl-2 pt-2 pb-2 lg:p-0`}>
              <CardIcon
                title={intl.simulations_call_count}
                value={counter.totalSimultaneousInterpretation || 0}
                borderVarient="border-[#67E364]"
                icon={<DashboardCall isMobile={isMobile} />}
              ></CardIcon>
            </div>
          </div>
        )}
        {!Admin && (
          <div className="grid grid-cols-2 xl:grid-cols-5 md:gap-2 mb-2 pb-2">
            <div className={`pr-2 pb-2 lg:p-0`}>
              <CardIcon
                title={intl.dashboard_card_number_of_connections_label}
                value={counter.licenseCount || 0}
                borderVarient="border-[#39A1EA]"
                icon={<DashboardConnections isMobile={isMobile} />}
              ></CardIcon>
            </div>
            <div className={`pr-2 pb-2 lg:p-0`}>
              <CardIcon
                title={intl.dashboard_card_active_connection_label}
                value={counter.numberOfLoggedInCount || 0}
                borderVarient="border-[#29AB91]"
                icon={<DashboardActiveConnection isMobile={isMobile} />}
              ></CardIcon>
            </div>
            <div className={`pr-2 pb-2 lg:p-0`}>
              <CardIcon
                title={intl.dashboard_card_invalid_connection_label}
                value={counter.numberOfLoggedOutCount || 0}
                borderVarient="border-[#FF7555]"
                icon={<DashboardDisabledConnections isMobile={isMobile} />}
              ></CardIcon>
            </div>
            <div className={`pr-2 pb-2 lg:p-0`}>
              <CardIcon
                title={intl.transcribe_count}
                value={counter.totalTranscribe || 0}
                borderVarient="border-[#E8C50D]"
                icon={<Transcribe isMobile={isMobile} />}
              ></CardIcon>
            </div>
            <div className={`pr-2 pb-2 lg:p-0`}>
              <CardIcon
                title={intl.simulations_call_count}
                value={counter.totalSimultaneousInterpretation || 0}
                borderVarient="border-[#67E364]"
                icon={<DashboardCall isMobile={isMobile} />}
              ></CardIcon>
            </div>
          </div>
        )}
        <div className="flex flex-col  lg:flex-row   lg:gap-x-2 ">
          <div className="mb-2 lg:mb-0 lg:w-1/3 ">
            <SearchList
              onInput={searchCompany}
              searchResults={searchResults}
              Admin={Admin}
              onLinkClick={handleLinkClick}
              height={512}
            />
          </div>
          <div className="flex flex-col gap-y-2  lg:w-2/3">
            <LineChart graphData={graphData} />
          </div>
        </div>
      </div>
    </>
  );
};
export default Dashboard;
