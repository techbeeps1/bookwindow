import Image from "next/image";


export function ImageBook({src,alt,size="30px"}:{src:string,alt:string,size?:string}) {
  return (

    <div className="group relative block w-full h-full transition-all duration-300">
          <div className={ `relative  bg-[#ededed] `} style={{padding:size}}>
            <div className="relative">
              <div className="relative aspect-[3/4]">
                <div
                  className="absolute top-[1%] right-0 h-[96%] w-[111.25px] rounded-[2px_6px_6px_2px] border border-gray-400 bg-white"
                  style={{
                    boxShadow:
                      "10px 20px 10px -10px rgba(77,77,77,.126), inset -2px 0 0 gray, inset -3px 0 0 #dbdbdb, inset -4px 0 0 #fff, inset -5px 0 0 #dbdbdb, inset -6px 0 0 #fff, inset -7px 0 0 #dbdbdb, inset -8px 0 0 #fff, inset -9px 0 0 #dbdbdb",
                  }}
                />

                <div
                  className="relative h-full cover cursor-pointer rounded-[2px_6px_6px_2px] transition-all duration-300 ease-in-out"
                  style={{
                    boxShadow:
                      "6px 0 10px -2px rgba(0,0,0,.2),24px 28px 40px -6px rgba(0,0,0,.1)",
                  }}
                >
                  <Image
                    width={768}
                    height={768}
                    src={src}
                    className={` block h-full w-full rounded-[0px_8px_8px_0px]`}
                    alt={alt}
                  />
                  <div
                    className="absolute top-0 ml-[10px] h-full w-[20px] z-[5]"
                    style={{
                      borderLeft: "2px solid rgba(0,0,0,.063)",
                      backgroundImage:
                        "linear-gradient(90deg,rgba(255,255,255,.2),rgba(255,255,255,0))",
                    }}
                  />
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
      </div>
  
  );
}

