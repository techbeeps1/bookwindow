import Link from "next/link";
const PRODUCTS = [
  {
    id: 1,    
    title: "An Insider’s Guide to Clinical Medicine",
    price: "₹1,295",
    image: "https://asset.ejaypee.com/images-new-2/9789366167602.jpg",
    link: "/products/an-insiders-guide-to-clinical-medicinepart-1-by-archith-boloor"
  },
  {
    id: 2,    
    title: "An Insider’s Guide to Clinical Medicine",
    price: "₹1,295",
    image: "https://asset.ejaypee.com/images-new-2/9789366167602.jpg",
    link: "/products/an-insiders-guide-to-clinical-medicinepart-1-by-archith-boloor"
  },
  {
    id: 3,   
    title: "An Insider’s Guide to Clinical Medicine",
    price: "₹1,295",
    image: "https://asset.ejaypee.com/images-new-2/9789366167602.jpg",
    link: "/products/an-insiders-guide-to-clinical-medicinepart-1-by-archith-boloor"
  },
  {
    id: 4,   
    title: "An Insider’s Guide to Clinical Medicine",
    price: "₹1,295",
    image: "https://asset.ejaypee.com/images-new-2/9789366167602.jpg",
    link: "/products/an-insiders-guide-to-clinical-medicinepart-1-by-archith-boloor"
  }
];

export function ProductList() {
  return (
    <section className="container mx-auto px-8 py-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {PRODUCTS.map((product) => (
          <div key={product.id} className=" pb-6 h-full w-full inline-block">
            <Link
              href={product.link}
              className="group relative block w-full h-full p-2 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative mb-4 bg-[#ededed] flex items-center justify-center p-10"> 

                {/* Book */}
                <div className="relative">
                  <div className="relative">
                    {/* Pages */}
                    <div
                      className="absolute top-[1%] right-0 h-[96%] w-[111.25px] rounded-[2px_6px_6px_2px] border border-gray-400 bg-white"
                      style={{
                        boxShadow:
                          "10px 20px 10px -10px rgba(77,77,77,.126), inset -2px 0 0 gray, inset -3px 0 0 #dbdbdb, inset -4px 0 0 #fff, inset -5px 0 0 #dbdbdb, inset -6px 0 0 #fff, inset -7px 0 0 #dbdbdb, inset -8px 0 0 #fff, inset -9px 0 0 #dbdbdb",
                      }}
                    />

                    {/* Cover */}
                    <div
                      className="relative cover cursor-pointer rounded-[2px_6px_6px_2px] transition-all duration-300 ease-in-out"
                      style={{              
                        boxShadow:
                          "6px 0 10px -2px rgba(0,0,0,.2),24px 28px 40px -6px rgba(0,0,0,.1)",              
                      }}
                    >
                      <img
                        src={product.image}
                        alt=""
                        className="block h-auto w-[150px]"
                      />

                      {/* Spine Effect */}
                      <div
                        className="absolute top-0 ml-[10px] h-full w-[20px] z-[5]"
                        style={{
                          borderLeft: "2px solid rgba(0,0,0,.063)",
                          backgroundImage:
                            "linear-gradient(90deg,rgba(255,255,255,.2),rgba(255,255,255,0))",
                        }}
                      />

                      {/* Light */}
                      <div
                        className="absolute right-0 top-0 h-full w-[90%] rounded-[3px] opacity-10 z-[4]"
                        style={{
                          backgroundImage:
                            "linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.2))",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div>
                <h4 className="line-clamp-3 text-[14px] text-center font-semibold leading-5 text-gray-900">
                  {product.title}
                </h4>

                <p className="mt-2 text-sm font-bold text-center text-gray-900">
                  {product.price}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

