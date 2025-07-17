import React from 'react';
import { FiTruck, FiCreditCard, FiCheck, FiArrowLeft, FiMapPin, FiPhone, FiMail, FiUser, FiNavigation } from 'react-icons/fi';

const PaymentMethod_2 = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <FiArrowLeft className="mr-2" />
            Continuar Comprando
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[{ id: 1, title: 'Información de Envío', icon: FiTruck }, { id: 2, title: 'Método de Pago', icon: FiCreditCard }, { id: 3, title: 'Confirmación', icon: FiCheck }].map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 bg-primary border-primary text-white">
                    {index < 1 ? <FiCheck className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                  </div>
                  <span className="ml-2 text-sm font-medium text-primary">{step.title}</span>
                </div>
                {index < 2 && <div className="w-16 h-0.5 mx-4 bg-primary" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Step 1: Shipping Information */}
              <div>
                <h2 className="text-xl font-semibold mb-6">Información de Envío</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiUser className="inline mr-1" />
                      Nombre
                    </label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiMail className="inline mr-1" />
                      Email
                    </label>
                    <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiPhone className="inline mr-1" />
                      Teléfono
                    </label>
                    <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        <FiMapPin className="inline mr-1" />
                        Dirección
                      </label>
                      <button className="flex items-center text-sm text-primary hover:text-primary/80">
                        <FiNavigation className="w-4 h-4 mr-1" />
                        Usar ubicación actual
                      </button>
                    </div>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Calle, número, colonia" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option value="México">México</option>
                      <option value="Estados Unidos">Estados Unidos</option>
                      <option value="Canadá">Canadá</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Método de Envío</h3>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="shippingMethod" value="standard" className="mr-3" />
                      <div className="flex-1">
                        <div className="font-medium">Envío Estándar</div>
                        <div className="text-sm text-gray-600">5-7 días hábiles</div>
                      </div>
                      <div className="font-medium">$50.00</div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="shippingMethod" value="express" className="mr-3" />
                      <div className="flex-1">
                        <div className="font-medium">Envío Express</div>
                        <div className="text-sm text-gray-600">2-3 días hábiles</div>
                      </div>
                      <div className="font-medium">$150.00</div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  Anterior
                </button>
                <button className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors ml-auto">
                  Siguiente
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
              <div className="space-y-3 mb-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center space-x-3">
                    <img src="https://via.placeholder.com/48" alt="Product" className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">Producto {item}</div>
                      <div className="text-xs text-gray-500">Color • Talla • Cantidad: 1</div>
                    </div>
                    <div className="text-sm font-medium">$99.99</div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>$299.97</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío</span>
                  <span>$50.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA (16%)</span>
                  <span>$47.99</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>$397.96</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod_2;
