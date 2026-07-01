"use client";
import React from "react";
import {
  Navbar,
  Typography,
  List,
  ListItem,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  IconButton,
  Collapse,
  typography,
} from "@material-tailwind/react";
import axios from "axios";
import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import config from "@/app/config";

const MainNavbar: React.FC = () => {
  const [openNav, setOpenNav] = React.useState(false);
  const [categories, setCategories] = React.useState([] as any);
  const [headerMenu, setHeaderMenu] = React.useState([] as any);

  const toggleNav = () => setOpenNav(!openNav);
  const closeNav = () => setOpenNav(false);

  // React.useEffect(() => {
  //   const fetchCategories = async () => {
  //     try {
  //       const response = await axios({
  //         method: "get",
  //         url: `${config.apiUrl}api/category`,
  //         responseType: "json",
  //       });
  //       setCategories(response.data);
  //     } catch (error) {
  //       console.log("error", error);
  //     } finally {
  //       // console.log("An error occured");
  //     }
  //   };

  //   fetchCategories();
  // }, []);

  React.useEffect(() => {
    const fetchHeaderMenu = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/menus/header_menu`,
          responseType: "json",
        });
        setHeaderMenu(response.data?.data);
      } catch (error) {
        console.log("error", error);
      } finally {
        // console.log("An error occured");
      }
    };

    fetchHeaderMenu();
  }, []);

  React.useEffect(() => {
    // console.log("headerMenu", headerMenu);
  }, [categories, headerMenu]);

  return (
    <Navbar
      className="w-full max-w-full backdrop-blur-2xl sticky top-20 z-40 border-0 px-4 py-2"
      {...({} as React.ComponentProps<typeof Navbar>)}
    >
      <div className="grid grid-col-7 text-blue-gray-900 justify-center">
        {/* <div className="w-full text-blue-gray-900 flex justify-center"> */}
        <div className="hidden gap-2 lg:flex">
          {/* <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4  gap-2"> */}
          <List
            className="mb-6 mt-4 p-8 lg:mb-0 lg:mt-0 lg:flex-row lg:p-1 gap-8 items-center"
            {...({} as React.ComponentProps<typeof List>)}
          >
            {headerMenu?.map((item: any, index: number) => (
              <div key={item?.id}>
              <ListItem
                key={item?.id}
                className="p-1"
                {...({} as React.ComponentProps<typeof ListItem>)}
              >
                {item.children && item.children?.length ? (
                  <Menu allowHover>
                    <MenuHandler>
                      <Typography
                        as="a"
                        href={
                          item.url === "#"
                            ? "#"
                            : index === 6
                            ? "current-affairs"
                            : `/category/${item.url}`
                        }
                        variant="small"
                        color="blue-gray"
                        className="font-medium flex items-center gap-1 whitespace-nowrap"
                        {...({} as React.ComponentProps<typeof Typography>)}
                      >
                        {item.name}
                        {[0, 1, 2, 3].includes(index) && (
                          <ChevronDownIcon
                            strokeWidth={2}
                            className="h-3 w-3 transition-transform"
                          />
                        )}
                      </Typography>
                    </MenuHandler>
                    {[0, 1, 2, 3].includes(index) && (
                      <MenuList
                        {...({} as React.ComponentProps<typeof MenuList>)}
                      >
                        {item.children?.map((child: any) => (
                          <div className="relative group" key={child?.id}>
                            <MenuItem
                              key={child?.id}
                              {...({} as React.ComponentProps<typeof MenuItem>)}
                            >
                              <Typography
                                as="a"
                                href={`/category/${child.url}`}
                                variant="small"
                                color="blue-gray"
                                className="font-medium flex items-center gap-1"
                                onClick={closeNav}
                                {...({} as React.ComponentProps<
                                  typeof Typography
                                >)}
                              >
                                {child.name}
                                {index === 3 && (
                                  <ChevronUpIcon
                                    strokeWidth={2.5}
                                    className="h-3 w-3 transition-transform"
                                    // className={`h-3.5 w-3.5 transition-transform ${
                                    //   isMenuOpen ? "rotate-90" : ""
                                    // }`}
                                  />
                                )}
                              </Typography>
                            </MenuItem>
                            {/* Third-level submenu on hover */}
                            {index === 3 && (
                              <div className="top-0 left-0 hidden group-hover:block bg-white shadow-lg rounded-xl min-w-[180px] z-[9999]">
                                {/* Example dynamic sub-child rendering */}
                                {child?.child?.map(
                                  (sub: any, subIndex: number) => (
                                    <Typography
                                      {...({} as React.ComponentProps<
                                        typeof Typography
                                      >)}
                                      key={subIndex}
                                      as="a"
                                      href={`/category/${sub.url}`}
                                      variant="small"
                                      className="block px-4 py-2 text-blue-gray-700 hover:bg-blue-gray-50 rounded transition-colors"
                                    >
                                      {sub.name}
                                    </Typography>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </MenuList>
                    )}
                  </Menu>
                ) : (
                  <Typography
                    as="a"
                    href={
                      index === 6 ? "/current-affairs": `/category/${item.url}`
                    }
                    variant="small"
                    color="blue-gray"
                    className="font-medium whitespace-nowrap"
                    onClick={closeNav}
                    {...({} as React.ComponentProps<typeof Typography>)}
                  >
                    {item.name}
                  </Typography>
                )}
              </ListItem>
              </div>
            ))}
          </List>
        </div>
        {/* <IconButton
          variant="text"
          color="blue-gray"
          className="lg:hidden"
          onClick={toggleNav}
          {...({} as React.ComponentProps<typeof IconButton>)}
        >
          {openNav ? (
            <XMarkIcon className="h-6 w-6" strokeWidth={2} />
          ) : (
            <Bars3Icon className="h-6 w-6" strokeWidth={2} />
          )}
        </IconButton> */}
      </div>

      {/* mobile menu */}
      <Collapse open={openNav}>
        <List
          className="flex flex-col gap-2 mt-2"
          {...({} as React.ComponentProps<typeof List>)}
        >
          {headerMenu.map((item: any, index: number) => (
            <div key={item?.id} className="relative">
              <ListItem
                className="p-1 flex items-center justify-between"
                {...({} as React.ComponentProps<typeof ListItem>)}
              >
                
                <Typography
                  as="a"
                  href={
                    item.url === "#"
                      ? "#"
                      : index === 6
                      ? "/current-affairs"
                      : `/category/${item.url}`
                  }
                  variant="small"
                  color="blue-gray"
                  className="font-medium flex-1"
                  onClick={closeNav}
                  {...({} as React.ComponentProps<typeof Typography>)}
                >
                  {item.name || item.label}
                </Typography>

               
                {item.children && (
                  <Menu allowHover>
                    <MenuHandler>
                      <ChevronDownIcon
                        strokeWidth={2}
                        className="h-4 w-4 ml-2 cursor-pointer"
                      />
                    </MenuHandler>
                    <MenuList
                      {...({} as React.ComponentProps<typeof MenuList>)}
                    >
                      {item.children.map((child: any, childIndex: number) => (
                        <MenuItem
                          key={childIndex}
                          {...({} as React.ComponentProps<typeof MenuItem>)}
                        >
                          <Typography
                            as="a"
                            href={`/category/${child.url}`}
                            variant="small"
                            color="blue-gray"
                            className="font-medium"
                            onClick={closeNav}
                            {...({} as React.ComponentProps<typeof Typography>)}
                          >
                            {child.name}
                          </Typography>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                )}
              </ListItem>
            </div>
          ))}
        </List>
      </Collapse>
    </Navbar>
  );
};

export default MainNavbar;
