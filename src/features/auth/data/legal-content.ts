export interface LegalSection {
  heading: string
  body: string
}

export interface LegalDoc {
  title: string
  intro?: string
  sections: LegalSection[]
}

export const LEGAL: { terms: LegalDoc; privacy: LegalDoc } = {
  terms: {
    title: "Términos y Condiciones",
    intro:
      "El uso de la plataforma Math.E está sujeto a los siguientes términos y condiciones, establecidos por el Colegio Claretiano para garantizar la privacidad y seguridad de sus usuarios.",
    sections: [
      {
        heading: "Uso de datos",
        body: "Los datos recopilados se utilizarán exclusivamente para la identificación del estilo de aprendizaje del estudiante y la mejora del sistema educativo. No se compartirán con terceros sin consentimiento expreso.",
      },
      {
        heading: "Privacidad",
        body: "Garantizamos la confidencialidad de los resultados académicos conforme a la Ley 1581 de 2012 de Protección de Datos Personales de Colombia.",
      },
      {
        heading: "Responsabilidades del usuario",
        body: "El usuario se compromete a utilizar la plataforma de manera honesta, respondiendo los cuestionarios de forma individual y sin compartir credenciales de acceso.",
      },
    ],
  },
  privacy: {
    title: "Política de Privacidad",
    intro:
      "En Math.E protegemos tu información personal y la de los estudiantes del Colegio Claretiano con el máximo cuidado.",
    sections: [
      {
        heading: "Marco legal",
        body: "Tratamos tus datos personales conforme a la Ley 1581 de 2012 de Protección de Datos Personales de Colombia.",
      },
      {
        heading: "Confidencialidad",
        body: "Los resultados académicos y los datos de tu perfil son confidenciales y se utilizan únicamente con fines educativos dentro del Colegio Claretiano.",
      },
      {
        heading: "Tus derechos",
        body: "No compartimos tu información con terceros sin tu consentimiento expreso. Puedes solicitar la consulta, actualización o eliminación de tus datos en cualquier momento.",
      },
    ],
  },
}
