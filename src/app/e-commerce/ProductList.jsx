import { motion } from "framer-motion";
import Nav from "./Nav";
import Dashbrand from "./DashBrand";

const ProductList = () => {
  return (
    <>
      <Nav />

      <section className="min-h-screen flex flex-col items-center justify-center pt-24">
        <motion.div
          className="text-center flex flex-col gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="w-3/4 lg:w-full  flex flex-col justify-center mx-auto mt-6">
          <h1 className="font-semibold  text-2xl md:uppercase lg:uppercase md:font-bold lg:font-bold mb-3">
            Explora nuestras marcas disponibles
          </h1>
          <h2 className="font-medium text-gray-700 text-xl sm:text-2xl   text-center ">
            Conoce los productos que tenemos para ti de cada una
          </h2>
          </div>
         
        </motion.div>

        <Dashbrand />
      </section>
    </>
  );
};

export default ProductList;
