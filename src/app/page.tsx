import Image from "next/image";
import background from '../../public/background.jpg'
import Link from "next/link";
export default function Home() {
  return (
    <main>
      <div className="relative min-h-screen w-full overflow-visible">
        <div>
          <div className="flex justify-center items-center w-full">
            <div className="relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-1/5 before:h-full before:bg-inherit before:z-10 before:bg-gradient-to-r before:from-[#18121c] before:to-transparent after:absolute after:top-0 after:right-0 after:w-1/5 after:h-full after:bg-inherit after:z-10 after:bg-gradient-to-l after:from-[#18121c] after:to-transparent">
              <Image src={background} alt="background" className="relative top-0 w-screen h-auto lg:w-auto lg:h-[85vh]" priority draggable="false" />
              <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-gradient-to-b from-transparent to-[#18121c] z-10"></div>
            </div>
          </div>

          <div className="h-[20px] lg:h-[4px]"></div>

          <div className="px-6 flex-grow w-full grid place-content-center gap-12 pb-[140px]">
            <div className="max-w-[700px] flex flex-col gap-[20px] lg:gap-[25px]">
              <h1 className="lg:text-3xl text-2xl my-4 animate-[fadeIn_0.5s] leading-[1.8] underline decoration-2 underline-offset-8">For You! Your Way! Always.</h1>
              <div className="text-left">
                <span className="text-base my-4 animate-[fadeIn_1.5s]">Our mission is to empower users like you to have greater control over your experiences and make your time spent more enjoyable.</span>
                <br />
                <br />
                <div className="animate-[fadeIn_2.3s] h-[1px] bg-[#DAD6C8]"></div>
                <ul>
                  <h2 className="text-[18px] my-4 animate-fadeIn animate-[fadeIn_2.5s]">We are building..</h2>
                  <li className="before:mr-2 before:content-hyphen before:animate-[fadeIn_2.5s]">
                    <Link href="https://enrych.github.io/toppings-web" className="font-bold hover:underline animate-[fadeIn_3s]">Toppings:</Link>
                    <span className="animate-[fadeIn_3s]"> a browser extension for your web, your way.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute my-4 lg:my-0 bottom-0 w-full h-[60px] flex justify-center items-center">
          <div>
            <footer>
              <div className="grid place-content-center">
                <div className="grid grid-cols-2 min-[500px]:grid-cols-3 items-center text-center text-xs text-[#DAD6C8] gap-6 ">
                  <Link className="text-xs" href="/">Enrych</Link>
                  <Link className="text-xs" href="https://github.com/enrych" target="_blank">GitHub</Link>
                  <Link className="text-xs" href="mailto:business.darhkvoyd@gmail.com">Contact</Link>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div >
    </main >
  );
}
