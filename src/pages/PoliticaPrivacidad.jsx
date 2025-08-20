import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const PoliticaPrivacidad = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-800">
              Política de Privacidad y Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Información que Recopilamos</h2>
              <p className="mb-2">
                En LIBAMAQ recopilamos información personal que nos proporciona voluntariamente cuando:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Se registra en nuestro sitio web</li>
                <li>Realiza una compra o solicita información sobre nuestros productos</li>
                <li>Se suscribe a nuestro boletín informativo</li>
                <li>Contacta con nuestro servicio al cliente</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Uso de la Información</h2>
              <p className="mb-2">
                Utilizamos la información recopilada para:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Procesar y gestionar sus pedidos</li>
                <li>Proporcionar atención al cliente</li>
                <li>Enviar actualizaciones sobre productos y promociones</li>
                <li>Mejorar nuestros productos y servicios</li>
                <li>Cumplir con requisitos legales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Protección de Datos</h2>
              <p>
                Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger 
                su información personal contra acceso no autorizado, alteración, divulgación o 
                destrucción. Utilizamos conexiones SSL encriptadas y almacenamiento seguro de datos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Compartir Información</h2>
              <p>
                No vendemos, intercambiamos o transferimos su información personal a terceros sin 
                su consentimiento, excepto cuando sea necesario para completar una transacción o 
                cuando lo requiera la ley.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Cookies</h2>
              <p>
                Utilizamos cookies para mejorar su experiencia de navegación. Puede configurar su 
                navegador para rechazar cookies, aunque esto podría limitar algunas funcionalidades 
                del sitio web.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Sus Derechos</h2>
              <p className="mb-2">
                Usted tiene derecho a:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Acceder a sus datos personales</li>
                <li>Rectificar información inexacta</li>
                <li>Solicitar la eliminación de sus datos</li>
                <li>Oponerse al procesamiento de sus datos</li>
                <li>Solicitar la portabilidad de sus datos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Menores de Edad</h2>
              <p>
                Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos 
                intencionalmente información personal de menores de edad.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Cambios a esta Política</h2>
              <p>
                Nos reservamos el derecho de modificar esta política de privacidad en cualquier 
                momento. Los cambios serán publicados en esta página con la fecha de actualización 
                correspondiente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Contacto</h2>
              <p>
                Si tiene preguntas sobre esta política de privacidad, puede contactarnos en:
              </p>
              <div className="mt-3 p-4 bg-gray-100 rounded-lg">
                <p><strong>Email:</strong> info@libamaq.com</p>
                <p><strong>Teléfono:</strong> +52 777 123 4567</p>
                <p><strong>Dirección:</strong> Morelos, México</p>
              </div>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-600">
              <p>
                <strong>Última actualización:</strong> Agosto 2024
              </p>
              <p>
                Esta política de privacidad cumple con los requisitos de verificación de Meta Business 
                y las normativas de protección de datos aplicables.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PoliticaPrivacidad;