import React from 'react'
import { motion } from "framer-motion";
import ValoresAccordion from './components/valores-accordion';
import MisionVision from './components/vision-mision';
import Footer from './components/footer';
import IconoWhats from './app/normal/IconoWhats';
import { Toaster } from 'sonner';
import Nav from './components/Nav';


export default function Nosotros() {
  return (
    <>

    <div className='min-h-screen bg-gray-100'>


    <Nav />

    <section className=' flex  w-full mt-18 pt-14 pb-4 m-auto  justify-center'>
    <h1 className='text-4xl font-bold'>Nosotros </h1>
    </section>
    

    <section className= 'mt-4'>
    <MisionVision />
    </section>


    

    <section className="py-10 px-6 border-1 m-auto ">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            Nuestros Valores
          </h2>
          <ValoresAccordion />
        </motion.div>
      </section>

      <IconoWhats />

      <Footer />
      <Toaster richColors position="top-right" />


    </div>

    </>
          
    
  )
}
