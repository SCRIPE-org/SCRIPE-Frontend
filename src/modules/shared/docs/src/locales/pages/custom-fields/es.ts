// FILE-EXCEPTION: file length
/**
 * Exported constant defining parameters and fields for es configurations.
 *
 * Custom Fields product documentation — Spanish (es). Twelve pages under the
 * Custom Fields section of the docs portal. Namespaced under
 * modules.customFields.docs so it never collides with the developer-facing
 * modules.customFields.overview page.
 *
 * Translation conventions used throughout this file:
 *
 * - Identifiers stay in Latin script exactly as in en.ts: field keys, entity-
 *   type registry keys such as party.person, error codes such as
 *   VALIDATION_REQUIRED, JSON/wire property names such as entityTypeKey, and
 *   quoted literal example inputs that test an exact format (a malformed
 *   email, a hex colour, a phone number, an option list used as a literal
 *   example). Only the prose around them is translated.
 * - Value-type names (Text, Select, MultiSelect, EntityReference, File,
 *   Image, RichText, and so on) are kept exactly as in the English interface
 *   whenever they name the literal type, matching the file's own documented
 *   convention that control names are shown as they appear in the English
 *   interface. The product's Custom Fields module has no Spanish locale of
 *   its own (only en and ar), so this file follows the same rule for every
 *   literal control, button, toggle and screen name — e.g. the Custom Fields
 *   screen, the Add custom field link, Target Entity Type, Required, Active,
 *   Sort Order, Not pinned — any allowed type, Global (all tenants) — while
 *   translating the generic, lower-case concept ("a custom field", "the
 *   value is required") freely into Spanish.
 * - This documentation section's own page titles and cross-references (Tipos
 *   de Valor, Grupos de Campos, Búsquedas de Referencia, Conjuntos de
 *   Opciones, and so on) are translated, since they are this docs portal's
 *   own navigation rather than literal product UI text.
 */
export const es = {
  modules: {
    customFields: {
      docs: {
        // ═══════════════════════════════════════════════════
        //  Custom Fields (section landing)
        // ═══════════════════════════════════════════════════
        home: {
          title: "Campos Personalizados",
          description:
            "Añade tus propios campos a los registros que ya usas: qué es un campo personalizado, de qué se compone, cómo se delimita su alcance y dónde encontrar el resto de la documentación.",
          intro:
            "Los campos personalizados te permiten añadir tu propia información a los registros con los que ya trabajas —una nacionalidad en una persona, un pie preferido en un jugador, un número de orden de compra en una reserva— sin esperar una nueva versión y sin que nadie tenga que escribir código. Defines el campo una sola vez en la pantalla Custom Fields, y a partir de ese momento aparece en cada formulario de creación y edición de ese tipo de registro, la lista de registros gana una columna para él, y el valor que escribes se almacena en ese registro concreto.",
          valueInfoTitle: "En una frase",
          valueInfoContent:
            "Un campo personalizado es una pregunta que decides hacer sobre un registro: la define una vez un administrador, y desde entonces la responde cualquier persona que rellene ese registro.",

          whatTitle: "Qué obtienes",
          whatIntro:
            "Los campos personalizados no son un cuadro de notas de texto libre pegado al lado de un registro. Cada uno es un campo real, tipado y con nombre propio, con sus propias reglas de validación, su propio lugar en el formulario, su propia columna en la lista y su propio historial de auditoría.",
          featDefineOnce: "Se define una vez, se usa en todas partes",
          featDefineOnceDesc:
            "Añade el campo en la pantalla Custom Fields y cada formulario de creación y edición de ese tipo de registro lo recoge automáticamente, junto con una columna adicional en la lista de registros. Sin nueva versión, sin código, sin esperas.",
          featTyped: "Se comprueba al entrar",
          featTypedDesc:
            "Cada tipo de valor tiene sus propias reglas —una dirección de correo real, un color hexadecimal, una valoración del 1 al 5— de modo que un valor incorrecto se rechaza con un mensaje concreto en lugar de quedar guardado en silencio y descubrirse seis meses después.",
          featValueTypes: "Veintidós tipos de valor",
          featValueTypesDesc:
            "Texto y texto largo, texto enriquecido con formato, elección única y múltiple, números, porcentajes, valoraciones, dinero, duraciones, fechas, fecha y hora con una zona horaria real, horas, correo electrónico, direcciones web, números de teléfono, sí/no y color, además de un archivo y una imagen, y dos que no almacenan texto en absoluto sino que apuntan a un registro de otra parte del producto.",
          featScoped: "Tuyo, o de toda la plataforma",
          featScopedDesc:
            "Un campo que creas pertenece únicamente a tu espacio de trabajo. Los administradores de la plataforma pueden crear campos globales que hereda cada espacio de trabajo y que ningún espacio de trabajo puede editar ni eliminar.",
          featSecured: "Restringible campo por campo",
          featSecuredDesc:
            "Un rol o un grupo de usuarios puede ocultar un campo concreto a quienes lo tienen asignado, y el producto no permitirá que alguien que no puede ver un valor lo borre editando el registro a su alrededor.",
          featAccountable: "Auditable",
          featAccountableDesc:
            "Cada cambio en una definición queda registrado con quién lo hizo y cuándo, un informe de uso indica cuántas respuestas tiene un campo antes de eliminarlo, y el conjunto completo de definiciones se exporta a una hoja de cálculo.",

          anatomyTitle: "De qué se compone un campo",
          anatomyIntro:
            "Este es el conjunto completo de elementos que lleva la definición de un campo. Tres de ellos son permanentes una vez guardados, porque las respuestas ya registradas contra ellos dejarían de tener sentido si cambiaran. Los nombres de los controles se muestran tal como aparecen en la interfaz en inglés.",
          thPart: "Ajuste",
          thWhat: "Qué es",
          thChange: "¿Se puede cambiar después?",
          partEntityType:
            "El tipo de registro al que pertenece el campo: personas, miembros del personal, reservas, etcétera.",
          partKey:
            "El nombre técnico, usado en los mensajes de error y en las exportaciones. En minúsculas, empieza por una letra, y solo admite letras, dígitos y guiones bajos.",
          partValueType:
            "Uno de los veintidós tipos, que decide qué se puede introducir y cómo se comprueba.",
          partLabelEn: "La etiqueta en inglés que la gente ve encima del campo de entrada.",
          partLabelAr:
            "La etiqueta en árabe, opcional. Si se deja en blanco, recurre a la etiqueta en inglés.",
          partPlaceholder:
            "Texto de sugerencia opcional, en gris, mostrado dentro del campo vacío, en cada idioma.",
          partRequired: "Si un registro se puede guardar dejando este campo en blanco.",
          partSortOrder:
            "Dónde se sitúa el campo respecto a los demás campos personalizados del formulario.",
          partFieldGroup: "El encabezado opcional bajo el que se agrupa el campo.",
          partOptions: "La lista de respuestas permitidas. Solo para Select y MultiSelect.",
          partValidator:
            "Una comprobación de formato adicional opcional, más su parámetro. Solo para campos Text.",
          partReferenceTarget:
            "El único tipo de registro al que pueden apuntar los valores de este campo, o ninguno, para dejar que cada valor elija el suyo. Solo para campos Entity Reference.",
          partSensitivity:
            "Una etiqueta de clasificación —Unclassified, Internal, Confidential o Restricted— para la elaboración de informes y el tratamiento en las exportaciones.",
          partExportable:
            "Un indicador que señala si los valores de este campo deben incluirse en las exportaciones. No afecta a la exportación de definiciones, que siempre incluye el campo e indica el estado de este indicador.",
          partActive:
            "Si el campo se sigue ofreciendo en los formularios. Un campo inactivo conserva las respuestas ya almacenadas.",
          partScope:
            "Si el campo pertenece a tu espacio de trabajo o a toda la plataforma. Lo decide quién lo crea.",
          changeNever: "No: permanente una vez guardado",
          changeAnytime: "Sí, en cualquier momento",
          changeAnytimeConditions: "Sí, salvo que un rol o un grupo restrinja el campo",
          changeAnytimeCare: "Sí, pero lee antes las advertencias",

          exampleTitle: "Un ejemplo completo, de principio a fin",
          exampleIntro:
            "Supongamos que la academia necesita registrar la nacionalidad de cada jugador y el producto no tiene un campo así. Nada de lo que sigue requiere un desarrollador.",
          ex1Title: "Decide qué estás preguntando",
          ex1Content:
            "La pregunta es «¿cuál es la nacionalidad de este jugador?». La respuesta es un texto breve sin una lista fija de opciones, así que el tipo de valor es Text. Si quisieras una lista fija, Select sería la opción correcta en su lugar, y esa decisión es permanente, así que merece un momento de reflexión.",
          ex2Title: "Define el campo",
          ex2Content:
            "En la pantalla Custom Fields, elige Add. Selecciona el tipo de registro para personas, pon la clave nationality, la etiqueta en inglés Nationality, el tipo de valor Text, y deja Required desactivado por ahora. Guarda.",
          ex3Title: "Rellénalo",
          ex3Content:
            "Abre cualquier registro de jugador. Una sección Custom Fields muestra ahora un campo Nationality, vacío. Escribe un valor y guarda el registro. Que no aparezca ningún error significa que el valor se aceptó y se almacenó contra ese jugador.",
          ex4Title: "Vuelve a consultarlo",
          ex4Content:
            "Vuelve a abrir el registro y ahí está el valor. La lista de registros también tiene ahora una columna Nationality, así que puedes ver la respuesta de cada jugador a la vez sin abrir ninguno de ellos.",
          ex5Title: "Endurécelo",
          ex5Content:
            "Más adelante decides que el campo debe rellenarse siempre. Edita la definición y activa Required. A partir de ese momento no se podrá guardar un jugador con Nationality en blanco, aunque los jugadores guardados antes con el campo en blanco se quedan tal cual hasta que alguien los edite.",

          scopeTitle: "Tu espacio de trabajo, o toda la plataforma",
          scopeIntro:
            "Un campo creado por un administrador dentro de un espacio de trabajo pertenece a ese espacio de trabajo. Nadie de otro espacio de trabajo lo ve, y sus respuestas nunca son visibles fuera de él. Este es el caso normal y no requiere ninguna reflexión.",
          scopeGlobal:
            "Un administrador de la plataforma que trabaja sin ningún espacio de trabajo seleccionado crea en su lugar un campo global, y el formulario muestra un interruptor Global (all tenants) cuando corresponde. Un campo global lo hereda cada espacio de trabajo: cualquiera puede rellenarlo, y nadie salvo un administrador de la plataforma puede editarlo, reordenarlo o eliminarlo. Los campos globales tampoco cuentan para la cuota de campos de cada espacio de trabajo.",
          scopeInfoTitle: "El alcance se decide al crear el campo",
          scopeInfoContent:
            "No hay forma de convertir un campo de espacio de trabajo en uno global, ni al revés. Si el alcance es incorrecto, el campo tiene que volver a crearse con el alcance adecuado, y las respuestas ya registradas contra el antiguo se quedan con el antiguo.",

          notTitle: "Qué no son los campos personalizados",
          notIntro:
            "Algunas cosas que razonablemente se esperarían de ellos y que deliberadamente no hacen.",
          not1: "No son un sustituto de una funcionalidad real. Un campo personalizado almacena y muestra una respuesta; no calcula nada, no dispara nada y no aparece en un informe que no hayas construido.",
          not2: "No son un mecanismo de control de acceso. El ajuste Sensitivity es una etiqueta. La seguridad a nivel de campo, configurada en roles y grupos de usuarios, es lo que realmente oculta un campo.",
          not3: "No son una biblioteca documental completa. File e Image guardan cada uno una única referencia gestionada, no un historial de versiones ni una galería; los flujos de adjuntos más amplios pertenecen a las propias funciones de adjuntos del registro. Adjuntar un nuevo valor File o Image todavía no está disponible desde esta pantalla; ambos tipos se pueden definir y un valor ya existente se puede consultar o borrar.",
          not4: "No son de formato libre. Cada campo tiene exactamente un tipo de valor, elegido de antemano y permanente, y cada valor se comprueba contra él al introducirlo.",
          not5: "No son retroactivos. Endurecer un campo —hacerlo obligatorio, o añadirle una comprobación de formato— nunca vuelve atrás para revisar las respuestas que ya estaban guardadas.",

          nextTitle: "Dónde seguir",
          nextIntro: "El resto de esta sección cubre cada parte en detalle.",
          thPage: "Página",
          thCovers: "Qué cubre",
          pageValueTypes: "Tipos de Valor",
          coversValueTypes:
            "Los veintidós tipos, uno por uno: qué almacena cada uno, qué acepta, qué rechaza, y ejemplos de entradas resueltos con el código de error que devuelve el producto.",
          pageReferences: "Campos de Referencia",
          coversReferences:
            "Los dos tipos que apuntan a un registro de otra parte del producto: cuál usar, qué se almacena realmente, por qué nunca se guarda un nombre junto con la referencia, cómo fijar un destino, qué se puede referenciar y las reglas de espacio de trabajo.",
          pageReferenceLookups: "Búsquedas de Referencia",
          coversReferenceLookups:
            "Las tres búsquedas que hay detrás de un campo de referencia, qué significa cada respuesta, los cinco estados de fallo y de quién es el problema en cada caso, qué ocurre cuando se elimina el registro referenciado, y cómo se comporta el selector.",
          pageDefining: "Definir un Campo",
          coversDefining:
            "El formulario de definición control por control, el recorrido completo, las reglas de nomenclatura de la clave, cómo crear un campo desde dentro de un registro, y cada rechazo con el que te puedes encontrar.",
          pageGroups: "Grupos de Campos",
          coversGroups:
            "Cómo agrupar los campos de un tipo de registro bajo encabezados, la clave estable, el orden, la eliminación, los grupos globales, y qué afectan y qué no afectan los grupos.",
          pageOptions: "Opciones",
          coversOptions:
            "Cómo escribir las respuestas permitidas para Select y MultiSelect, el editor bilingüe de opciones, cómo se compara un valor enviado, y qué le ocurre a los registros existentes cuando la lista cambia más adelante.",
          pageValidators: "Validadores",
          coversValidators:
            "Las 13 comprobaciones de formato integradas, con ejemplos de entradas válidas e inválidas, las seis que necesitan un parámetro, los siete países de código postal admitidos, y qué aspecto tiene un rechazo.",
          pageSecurity: "Seguridad a Nivel de Campo",
          coversSecurity:
            "Cómo restringir un campo en un rol o grupo de usuarios, qué ve una persona restringida, por qué sus guardados no destruyen los valores ocultos, y por qué obligatorio y restringido no se pueden combinar.",
          pageManaging: "Gestión de Campos",
          coversManaging:
            "Edición, desactivación, el cuadro de historial de la definición, el informe de uso e impacto, la eliminación sin destruir datos, la exportación a hoja de cálculo, y las dos pantallas de referencia de solo lectura.",
          pageLimits: "Límites y Comportamientos",
          coversLimits:
            "Cada límite fijo, cada limitación deliberada, y el motivo de cada una, para que no te pases una tarde buscando un ajuste que no existe.",

          accessTitle: "Permisos",
          accessIntro:
            "Trabajar con definiciones necesita permisos propios. Rellenar un campo que ha definido otra persona no necesita nada más que acceso al propio registro.",
          thNeed: "Permiso",
          thWhoNeedsIt: "Qué permite",
          permView:
            "Ver la pantalla Custom Fields, la lista de definiciones, los cuadros de History y Usage, y las dos pantallas de referencia de solo lectura.",
          permCreate:
            "Crear una definición, incluso a través del enlace Add custom field dentro de un formulario de registro.",
          permUpdate: "Editar una definición existente.",
          permDelete:
            "Eliminar una definición, incluida la confirmación de una eliminación destructiva.",
          permGroups:
            "La funcionalidad de grupos de campos, controlada por separado. Un rol que ya tiene cada uno de los permisos de campos personalizados anteriores no obtiene estos automáticamente.",
          planInfoTitle: "Los campos personalizados forman parte de tu plan",
          planInfoContent:
            "La funcionalidad está sujeta a derechos de uso y a una cuota: la edición Free no permite ningún campo, y cada plan tiene un número máximo de campos por espacio de trabajo. Si falta la pantalla Custom Fields, no aparece el botón Add, o un guardado se rechaza por cuota, es una cuestión de plan y no un fallo. Los campos globales de la plataforma no cuentan para la cuota de un espacio de trabajo.",
        },

        // ═══════════════════════════════════════════════════
        //  Value Types
        // ═══════════════════════════════════════════════════
        valueTypes: {
          title: "Tipos de Valor",
          description:
            "Los veintidós tipos de valor de los campos personalizados: qué almacena cada uno, qué acepta y qué rechaza exactamente, ejemplos de entradas resueltos, y los códigos de error que devuelve el producto.",
          intro:
            "Cada campo personalizado tiene exactamente un tipo de valor, elegido al definir el campo. El tipo de valor decide qué control aparece en el formulario, qué acepta el producto, cómo se almacena el valor y cómo se muestra después. Esta página cubre los veintidós, uno por uno, con ejemplos de entradas que se aceptan y ejemplos de entradas que se rechazan. Dieciocho de ellos almacenan algo que tú escribiste; los otros cuatro almacenan en su lugar un puntero: dos a un registro de otra parte del producto, con una página propia además, y dos a un único archivo o imagen subidos.",
          permanentTitle:
            "Cambiar el tipo de valor más adelante es una operación aparte y restringida",
          permanentContent:
            "Nueve pares de tipos concretos se pueden convertir después, desde la propia acción del menú de fila del campo — ver Gestión de Campos —, pero cualquier otro par se rechaza de plano, y convertir no es algo con lo que contar de antemano: elige el tipo correcto desde el principio siempre que puedas, porque el resultado, con diferencia más frecuente al elegir mal, es eliminar y volver a crear el campo, perdiendo las respuestas ya almacenadas contra él.",

          orderTitle: "Cómo se comprueba un valor enviado",
          orderIntro:
            "Cada guardado ejecuta los mismos cuatro pasos, en el mismo orden, para cada tipo. Conocer el orden explica la mayoría de las sorpresas.",
          order1:
            "¿Está vacío el valor? Un valor ausente, una cadena en blanco o una cadena hecha solo de espacios cuenta como vacío. Para MultiSelect una lista vacía también cuenta, y para DateTime, Currency y los cuatro tipos con forma de referencia (EntityReference, UserReference, File, Image) un valor cuenta como vacío solo cuando faltan sus dos partes a la vez.",
          order2:
            "Si está vacío y el campo es Required, el guardado se rechaza con VALIDATION_REQUIRED. Si está vacío y el campo no es obligatorio, el valor almacenado se borra y no se ejecuta nada más: ni comprobación de tipo, ni validador.",
          order3:
            "Si no está vacío, se ejecutan las reglas propias del tipo: límites de longitud, interpretación de números, comprobaciones de rango, coincidencia con las opciones permitidas, comprobaciones de formato.",
          order4:
            "Para un campo Text con un validador asignado, y solo entonces, el validador se ejecuta el último: después del límite global de 4.000 caracteres y después del límite de longitud propio, más corto, del validador.",
          orderKeyNote:
            "Un detalle que conviene saber antes de leer cualquier mensaje de error: el mensaje nombra la clave del campo, no su etiqueta. Un campo etiquetado Nationality con la clave nationality produce «'nationality' expects a date.», no «'Nationality'».",

          thExample: "Entrada de ejemplo",
          thOutcome: "Qué ocurre",

          groupTextTitle: "Texto y opciones",
          textTitle: "Text",
          textStores:
            "Una sola línea de texto libre, hasta 4.000 caracteres. Se representa como un campo de entrada de una sola línea corriente.",
          textChecks:
            "La única comprobación es el límite de longitud, salvo que se asigne un validador, lo que convierte a Text en el único tipo que puede llevar una comprobación de formato. El valor se almacena exactamente tal como se envió; a diferencia de Select, Text no recorta los espacios que lo rodean.",
          textOk: "Aceptado, y almacenado exactamente tal como se envió.",
          textTooLong:
            "Rechazado: VALIDATION_MAX_LENGTH. Text se detiene en 4.000 caracteres; usa LongText para cualquier cosa más larga.",
          textBlankOptional:
            "Aceptado, y almacenado como borrado. Un valor hecho solo de espacios cuenta como vacío, así que cualquier validador asignado nunca llega a ejecutarse sobre él.",
          textBlankRequired:
            "Rechazado: VALIDATION_REQUIRED. Aquí también un valor hecho solo de espacios cuenta como vacío.",
          exText4500: "Un valor de 4.500 caracteres de longitud",
          exSpacesOptional: "Tres espacios, en un campo que no es Required",
          exSpacesRequired: "Tres espacios, en un campo Required",

          longTextTitle: "LongText",
          longTextStores:
            "Contenido libre más largo, hasta 10.000 caracteres. Se representa como un área de texto multilínea real, no como una caja de una sola línea más alta.",
          longTextChecks:
            "Solo el límite de 10.000 caracteres. LongText no puede llevar un validador. El contador en pantalla se pone rojo en cuanto superas el límite, pero no te impide seguir escribiendo; el rechazo llega al guardar.",
          longTextOk:
            "Aceptado. Esto supera con holgura el límite propio de Text de 4.000 caracteres, que es la razón de ser de LongText.",
          longTextTooLong:
            "Rechazado: VALIDATION_MAX_LENGTH, indicando el límite de 10.000 caracteres.",
          exLong6000: "Una descripción de 6.000 caracteres",
          exLong12000: "Una descripción de 12.000 caracteres",

          selectTitle: "Select",
          selectStores:
            "Una respuesta elegida de una lista que tú mismo escribes. Se representa como un desplegable que ofrece exactamente tus opciones.",
          selectChecks:
            "El valor enviado debe coincidir exactamente con una de las opciones configuradas del campo. Ambos lados se recortan antes de compararse, y la comparación distingue mayúsculas de minúsculas. Para una lista de opciones Small, Medium, Large:",
          selectOk: "Aceptado, y almacenado como el propio texto de la opción.",
          selectTrimmed:
            "Aceptado. Los espacios que lo rodean se recortan antes de la comparación.",
          selectCase:
            "Rechazado: VALIDATION_INVALID_FORMAT. La coincidencia distingue mayúsculas de minúsculas, así que Medium y medium son respuestas distintas, lo que también significa que las dos pueden existir legítimamente como opciones independientes.",
          selectUnknown:
            "Rechazado: VALIDATION_INVALID_FORMAT. El mensaje cita el valor rechazado y la clave del campo.",
          exSelectPadded: '" Medium" con un espacio inicial',

          multiSelectTitle: "MultiSelect",
          multiSelectStores:
            "Varias respuestas del mismo tipo de lista, hasta 19 de ellas. Se representa como un combobox de selección múltiple con un contador en vivo «N de 19 seleccionadas».",
          multiSelectChecks:
            "Cada respuesta enviada debe ser una de las opciones configuradas del campo, ninguna respuesta puede repetirse, y puede haber como máximo 19. El orden en que se eligen se conserva de principio a fin. Para una lista de opciones Red, Green, Blue, Yellow:",
          multiOk:
            "Aceptado, y devuelto en el orden en que se eligió —primero Blue, luego Red—, sin reordenar según el orden en que aparecían las opciones en la lista.",
          multiTooMany:
            "Rechazado: VALIDATION_MAX_LENGTH, indicando el tope de 19. El propio selector hace que la opción número veinte no se pueda marcar, así que llegar a esto exige una solicitud que se salte el formulario.",
          multiDuplicate:
            "Rechazado: VALIDATION_UNIQUE. Una respuesta repetida se rechaza en lugar de reducirse silenciosamente a una sola.",
          multiUnknown:
            "Rechazado: VALIDATION_INVALID_FORMAT — Purple no es una de las opciones del campo.",
          multiEmpty:
            "Tratado como vacío: se borra si el campo es opcional, se rechaza con VALIDATION_REQUIRED si es obligatorio.",
          exMultiTwo: "Blue, y luego Red",
          exMultiTwenty: "20 selecciones",
          exMultiRepeat: "Red, y luego Red otra vez",
          exMultiEmptyList: "Una lista explícitamente vacía",

          groupNumberTitle: "Números y medidas",
          numberTitle: "Number",
          numberStores:
            "Cualquier número, entero o con decimales, positivo o negativo, con hasta seis decimales.",
          numberChecks:
            "Solo que el valor se interprete como un número. No se aplica ninguna regla de mínimo, máximo, precisión o redondeo, así que elige Number cuando de verdad cualquier número sea una respuesta válida, y elige Percent, Rating, Currency o Duration cuando no lo sea.",
          numberOk: "Aceptado.",
          numberNegative:
            "Aceptado. Los valores negativos son perfectamente válidos para este tipo.",
          numberPrecision:
            "Aceptado, y almacenado con seis decimales. Cualquier precisión mayor no se conserva.",
          numberInvalid:
            "Rechazado: VALIDATION_INVALID_FORMAT — el mensaje dice «expects a number». Un número escrito con palabras no se interpreta.",
          exAboutForty: '"about 40"',

          percentTitle: "Percent",
          percentStores:
            "Un porcentaje entre 0 y 100 ambos inclusive, con decimales permitidos. Se representa como un simple campo numérico, y se muestra después como el número con un signo % añadido.",
          percentChecks:
            "El valor debe interpretarse como un número y caer entre 0 y 100. Se almacena exactamente tal como se escribió; este es el detalle que hay que tener claro si alguna vez lees los datos en bruto o construyes una exportación.",
          percentOk: "Aceptado, y mostrado después como 25%.",
          percentDecimal:
            "Aceptado, y mostrado como 33,5%. Las fracciones de un punto porcentual se conservan con exactitud.",
          percentQuarter:
            "Aceptado, pero significa una cuarta parte de un uno por ciento, mostrado como 0,25%. Percent almacena el número que dirías en voz alta, nunca una fracción de 0 a 1.",
          percentTooHigh: "Rechazado: VALIDATION_RANGE, indicando los límites 0 y 100.",
          percentNegative: "Rechazado: VALIDATION_RANGE. El límite inferior es 0, y es inclusive.",

          ratingTitle: "Rating",
          ratingStores:
            "Un número entero del 1 al 5, capturado en un control deslizante. Se muestra después como «4 / 5».",
          ratingChecks:
            "El valor debe interpretarse como un número, ser un número entero, y caer entre 1 y 5 ambos inclusive. No hay control de estrellas ni entrada de texto libre.",
          ratingOk: "Aceptado, y mostrado como 4 / 5.",
          ratingZero:
            "Rechazado: VALIDATION_RANGE. Un cero es un valor enviado real que no supera la comprobación de rango de 1 a 5; no se interpreta como «sin valorar».",
          ratingFraction:
            "Rechazado: VALIDATION_RANGE. Las valoraciones con decimales no están permitidas; esta es una diferencia real respecto a Number, que admite cualquier decimal.",
          ratingTooHigh: "Rechazado: VALIDATION_RANGE, con el mismo mensaje que recibe un 0.",
          ratingUntouched:
            "Se guarda como vacío, no como 1. El control deslizante tiene que apoyarse en algún punto, así que un campo sin tocar se muestra en su posición más a la izquierda; eso es un artefacto visual, no una respuesta almacenada.",
          exRatingUntouched: "El control deslizante sin tocar en un registro nuevo",

          currencyTitle: "Currency",
          currencyStores:
            "Un importe junto con su código de moneda de tres letras, contenidos en dos campos independientes dentro de un mismo grupo etiquetado. Se muestra después mediante el propio formato numérico del lector, mostrando el código en lugar de un símbolo para que EUR y USD nunca resulten ambiguos.",
          currencyChecks:
            "Las dos partes son obligatorias juntas. El importe debe interpretarse como un número; el código debe ser exactamente tres letras ASCII en mayúsculas. El campo del código pasa a mayúsculas y filtra letras mientras escribes, porque la comprobación en sí no admite minúsculas: las rechaza.",
          currencyOk:
            "Aceptado. Se muestra como el importe junto al código, por ejemplo USD 100.50.",
          currencyLower:
            "Rechazado si llega a alcanzar el servidor: VALIDATION_INVALID_FORMAT, indicando el requisito de tres letras según ISO 4217. En el propio formulario, el campo fuerza las mayúsculas mientras escribes, así que normalmente no verás esto.",
          currencyNoCode:
            "Rechazado: VALIDATION_INVALID_FORMAT. El formulario también bloquea esto antes de llamar al servidor, con un mensaje que indica que el campo necesita a la vez un importe y un código de moneda.",
          currencyNoAmount:
            "Rechazado de la misma forma. Un código sin importe es un valor roto, no uno vacío; solo cuando faltan las dos partes cuenta como vacío.",
          currencyZzz:
            "Aceptado. Solo se comprueba la forma del código, nunca si pertenece a la lista real de ISO 4217, así que un código con buena forma pero inexistente pasa el control. La visualización recurre a «ZZZ 100.50» para un código que el navegador del lector no reconoce.",
          currencyMinor:
            "Aceptado, y significa diez mil cincuenta. No hay unidades menores en ningún punto del almacenamiento de campos personalizados: 100.50 se almacena como 100.50, nunca como 10050.",
          exCurrencyOk: "100.50 con el código USD",
          exCurrencyLower: "100.50 con el código usd",
          exCurrencyNoCode: "100.50 con el código en blanco",
          exCurrencyNoAmount: "El importe en blanco con el código USD",
          exCurrencyZzz: "100.50 con el código ZZZ",
          exCurrencyMinor: "10050 con el código USD",

          durationTitle: "Duration",
          durationStores:
            "Una duración contada en minutos. Se representa como un campo numérico con una etiqueta visible de «minutes» al lado, nunca como un número desnudo sin etiquetar.",
          durationChecks:
            "El valor debe interpretarse como un número y no debe ser negativo. El cero se acepta: es un «sin margen» legítimo. No hay ningún límite superior.",
          durationOk: "Aceptado, y mostrado como 90 minutes.",
          durationFraction:
            "Aceptado, y conservado exactamente como 1.5, es decir, noventa segundos. Los decimales no se redondean a minutos enteros.",
          durationZero: "Aceptado. El cero es una respuesta real, no una vacía.",
          durationLarge:
            "Aceptado: 5.400 minutos, que son tres días y medio. Nada te avisa, porque no hay máximo.",
          durationNegative:
            "Rechazado: VALIDATION_RANGE, con un mensaje que indica que el valor no debe ser negativo.",

          groupDateTitle: "Fechas y horas",
          dateTitle: "Date",
          dateStores:
            "Una fecha de calendario sin ningún componente de hora: un cumpleaños, la fecha de un contrato, una caducidad. Se representa como un selector de fecha.",
          dateChecks:
            "Solo que el valor se interprete como una fecha. Como el valor almacenado es una fecha de calendario simple y no un instante concreto, se lee igual para cualquier persona que la consulte, sin importar su zona horaria.",
          dateOk:
            "Aceptado, y devuelto como la misma fecha de calendario para cualquiera que lo consulte, desde cualquier lugar.",
          dateNoTime:
            "Ignorada. Date no lleva componente de hora, así que una hora enviada junto con la fecha simplemente no se almacena. Usa DateTime cuando la hora importe.",
          dateInvalid: "Rechazado: VALIDATION_INVALID_FORMAT — el mensaje dice «expects a date».",
          exDateWithTime: "Una fecha con un componente de hora adjunto",
          exNotADate: '"next Tuesday"',

          dateTimeTitle: "DateTime",
          dateTimeStores:
            "Un instante preciso junto con la zona horaria a la que pertenece. Se almacenan las dos mitades, así que un inicio a las 18:00 en El Cairo se sigue leyendo como las 18:00 en El Cairo para alguien que lo consulte desde Londres.",
          dateTimeChecks:
            "El instante debe interpretarse, y la zona horaria debe ser un identificador de zona que el servidor reconozca: en la práctica, un identificador IANA como Africa/Cairo, aunque la comprobación subyacente depende de la plataforma y un despliegue alojado en Windows también acepta un identificador nativo de Windows como Egypt Standard Time. La zona es obligatoria en cuanto está presente cualquiera de las dos mitades: un instante sin zona se rechaza, no se interpreta silenciosamente. El formulario muestra la zona como un pequeño detalle junto a la hora introducida, con un enlace Change que abre un selector con búsqueda.",
          dateTimeOk:
            "Aceptado. Tanto el instante como su zona se devuelven exactamente como se introdujeron.",
          dateTimeNoZone:
            "Rechazado: VALIDATION_INVALID_TIMEZONE. Un instante sin zona es exactamente lo que DateTime existe para impedir.",
          dateTimeBadZone:
            "Rechazado: VALIDATION_INVALID_TIMEZONE, indicando el identificador no reconocido. Las zonas son nombres IANA reales como Africa/Cairo o Asia/Tokyo.",
          dateTimeEmpty:
            "Tratado como vacío: se borra si el campo es opcional, se rechaza con VALIDATION_REQUIRED si es obligatorio. Solo cuando faltan las dos mitades cuenta como vacío.",
          exDateTimeOk: "18:00 del 21 de agosto de 2026, zona Africa/Cairo",
          exDateTimeNoZone: "18:00 del 21 de agosto de 2026, zona en blanco",
          exDateTimeBadZone: "18:00 del 21 de agosto de 2026, zona Not/AZone",
          exDateTimeBothBlank: "El instante y la zona, ambos en blanco",

          timeTitle: "Time",
          timeStores:
            "Una hora del día en formato de 24 horas, con segundos incluidos y sin fecha asociada: un horario de apertura, un toque de queda, una franja de inicio. Se representa como un selector de hora nativo con segundos activados, y se muestra después en el formato horario local propio de cada lector.",
          timeChecks:
            "El valor debe ser horas, minutos y segundos separados por dos puntos, con horas de 0 a 23, minutos de 0 a 59 y segundos de 0 a 59. Una entrada sin ceros a la izquierda se acepta y se normaliza en lugar de rechazarse.",
          timeOk:
            "Aceptado, y mostrado en el formato propio del lector; por ejemplo, 2:30:00 PM para un lector en inglés (EE. UU.).",
          timeNormalised:
            "Aceptado, y normalizado a 09:05:00 antes de almacenarse. Dos envíos de la misma hora escritos con distinto número de dígitos siempre acaban siendo idénticos.",
          timeHourRange:
            "Rechazado: VALIDATION_INVALID_FORMAT. Las horas van de 0 a 23, así que 24 está fuera de rango.",
          timeMinuteRange: "Rechazado: VALIDATION_INVALID_FORMAT. Los minutos van de 0 a 59.",
          timeAmPm:
            "Rechazado: VALIDATION_INVALID_FORMAT. El texto en formato de 12 horas no se interpreta; la forma almacenada siempre es de 24 horas, aunque la visualización no lo sea.",

          groupContactTitle: "Datos de contacto y enlaces",
          emailTitle: "Email",
          emailStores:
            "Una dirección de correo electrónico. Se representa como un campo nativo de correo electrónico, y se muestra después como un enlace de correo en el que se puede hacer clic.",
          emailChecks:
            "La dirección se interpreta como una dirección real en lugar de compararse con un patrón, y no debe contener nada más que la dirección. Las mayúsculas y minúsculas se conservan exactamente tal como se escribieron, sin convertir a minúsculas.",
          emailOk:
            "Aceptado, almacenado con su capitalización exacta, y mostrado como un enlace de correo en el que se puede hacer clic.",
          emailDisplayName:
            "Rechazado: VALIDATION_INVALID_EMAIL. Un envoltorio con nombre para mostrar se interpreta como una dirección, pero se rechaza en lugar de eliminarse en silencio, porque un campo Email no tiene ningún nombre para mostrar que conservar.",
          emailInvalid: "Rechazado: VALIDATION_INVALID_EMAIL.",
          exEmailDisplayName: '"Test User <test@example.com>"',

          urlTitle: "Url",
          urlStores:
            "Una dirección web. Se representa como un campo nativo de URL, y se muestra después como un enlace real que se abre en una pestaña nueva.",
          urlChecks:
            "El valor debe ser una dirección absoluta cuyo esquema sea exactamente http o https. Cualquier otro esquema se rechaza. El esquema se vuelve a comprobar al mostrarse, antes de que el valor llegue a representarse como enlace.",
          urlOk: "Aceptado, y mostrado como un enlace que se abre en una pestaña nueva.",
          urlHttpOk:
            "Aceptado. El http simple está permitido deliberadamente: el sitio de una empresa o una dirección interna durante la puesta en marcha son datos legítimos.",
          urlNoScheme:
            "Rechazado: VALIDATION_INVALID_FORMAT. Un host desnudo se rechaza en lugar de intentar adivinarlo, para que nada tenga que decidir si querías decir http o https.",
          urlScheme:
            "Rechazado: VALIDATION_INVALID_FORMAT. Esto es un límite de seguridad real, no una norma de estilo, y como el esquema se vuelve a comprobar antes de mostrarse, incluso un valor almacenado antes de que existiera esta comprobación se muestra como texto inerte y no como un enlace activo.",
          urlFtp: "Rechazado: VALIDATION_INVALID_FORMAT. Solo http y https están en la lista.",

          phoneTitle: "Phone",
          phoneStores:
            "Un número de teléfono en formato internacional. Se representa mediante un selector de país con banderas y búsqueda, y se muestra después reformateado para facilitar la lectura; por ejemplo, +20 123 456 7890.",
          phoneChecks:
            "El valor almacenado debe empezar por +, su primer dígito no puede ser cero, y debe contener entre 8 y 15 dígitos en total. Eso es una comprobación de forma únicamente.",
          phoneOk:
            "Aceptado, y mostrado reformateado en lugar de como la cadena almacenada desnuda.",
          phoneNoPlus:
            "Rechazado: VALIDATION_INVALID_FORMAT. El + inicial forma parte del formato.",
          phoneLeadingZero:
            "Rechazado: VALIDATION_INVALID_FORMAT. Un código de país nunca empieza por cero.",
          phoneTooShort:
            "Rechazado: VALIDATION_INVALID_FORMAT. Siete dígitos está por debajo del mínimo de ocho.",
          phoneUnassignable:
            "Aceptado por el servidor, que solo comprueba la forma y no si el número podría existir de verdad. El propio selector del formulario además comprueba el número contra el plan de numeración real del país seleccionado, así que no puedes construir este valor a través de la interfaz, solo con una solicitud que se salte el formulario.",

          groupOtherTitle: "Sí/no y color",
          booleanTitle: "Boolean",
          booleanStores:
            "Un simple sí o no. Se representa como un interruptor de encendido/apagado. No tiene ni texto de sugerencia ni opciones.",
          booleanChecks:
            "Solo se interpretan las palabras true y false, en cualquier combinación de mayúsculas y minúsculas. Nada más se trata como sinónimo.",
          boolTrue: "Aceptado.",
          boolFalse: "Aceptado.",
          boolOne:
            "Rechazado: VALIDATION_INVALID_FORMAT — el mensaje dice «expects a boolean». Un 1 numérico no se interpreta como true.",
          boolYes: "Rechazado: VALIDATION_INVALID_FORMAT. Ni yes/no ni on/off se aceptan.",

          colorTitle: "Color",
          colorStores:
            "Un color, almacenado como valor hexadecimal. Se representa como una cuadrícula de veinte muestras más una entrada hexadecimal personalizada, y se muestra después como el texto hexadecimal con una pequeña muestra de color a juego al lado.",
          colorChecks:
            "El valor debe ser un # seguido de exactamente tres o exactamente seis dígitos hexadecimales. Las mayúsculas se normalizan a minúsculas al guardar; la longitud no.",
          colorOk:
            "Aceptado, y almacenado como #aabbcc. Las mayúsculas se convierten a minúsculas.",
          colorShort:
            "Aceptado, y conservado como #abc. La forma abreviada nunca se expande a #aabbcc, aunque un motor de representación trate ambas como el mismo color, así que el mismo color puede almacenarse legítimamente de dos formas distintas en registros diferentes.",
          colorNoHash: "Rechazado: VALIDATION_INVALID_FORMAT. El # inicial es obligatorio.",
          colorBadLength:
            "Rechazado: VALIDATION_INVALID_FORMAT. Tres o seis dígitos, nada intermedio.",
          colorNamed:
            "Rechazado: VALIDATION_INVALID_FORMAT. Los nombres de color no se aceptan, solo valores hexadecimales.",

          groupReferenceTitle: "Referencias a otro registro",
          referenceGroupIntro:
            "Los dos últimos tipos no almacenan texto propio. Cada uno guarda un puntero a un registro de otra parte del producto, y el nombre que ves se busca de nuevo cada vez que se muestra el campo, en lugar de guardarse junto con el puntero. Ambos almacenan las mismas dos partes —el tipo de registro y la identidad propia de ese registro— y ambos tratan un valor como vacío solo cuando faltan las dos partes. Hay mucho más que decir sobre ellos de lo que cabe en una tabla; las páginas Campos de Referencia y Búsquedas de Referencia lo dicen.",
          entityReferenceTitle: "EntityReference",
          entityReferenceStores:
            "Un puntero a un registro de cualquier tipo que esta instalación pueda resolver y que tengas permiso para ver. Se representa como un selector con búsqueda sobre ese tipo de registro, precedido por un segundo selector para el propio tipo, cuando la definición no fija uno.",
          entityReferenceChecks:
            "Las dos partes son obligatorias juntas. El tipo de registro debe estar registrado y, cuando la definición fija uno, debe ser ese. La identidad debe poder leerse. Y debes haber podido leer ese registro en el momento de guardar, que es lo que impide que un puntero se use para llegar a datos que no puedes abrir directamente. Cada comprobación se rechaza con su propio mensaje en lugar de uno genérico.",
          refOk:
            "Aceptado. La respuesta registra tanto el tipo de registro como la identidad de ese registro, y el selector muestra desde entonces el nombre actual del registro.",
          refIncomplete:
            "Rechazado por ser una referencia incompleta. Medio puntero no se trata como un campo vacío: significa que alguien empezó a responder y se detuvo.",
          refIncompleteToo:
            "Rechazado de la misma forma. Una identidad sin tipo de registro nombra una fila pero no una tabla, así que no hay dónde buscarla.",
          refMismatch:
            "Rechazado, y el mensaje indica tanto lo que el campo espera como lo que llegó. El anclaje es una restricción deliberada, así que esto es el rechazo funcionando, no fallando.",
          refUnknownType:
            "Rechazado: ENTITY_UNKNOWN_TYPE, indicando el identificador. Solo se puede alcanzar con una solicitud que se salte el selector, que nunca ofrece un tipo de registro no registrado.",
          refInvalidId:
            "Rechazado: ENTITY_INVALID_ID. Una identidad es opaca y debe devolverse exactamente tal como se recibió; un carácter alterado la vuelve ilegible.",
          refForbidden:
            "Rechazado: AUTH_FORBIDDEN, indicando el campo. Almacenar un puntero a un registro es una lectura diferida de ese registro, así que necesita el mismo permiso que necesitaría leerlo.",
          refEmpty:
            "Tratado como vacío: se borra si el campo es opcional, se rechaza con VALIDATION_REQUIRED si es obligatorio. Solo cuando faltan las dos partes cuenta como vacío.",
          exRefOk: "Un miembro del personal elegido del selector",
          exRefTypeOnly: "Un tipo de registro elegido, sin ningún registro seleccionado",
          exRefIdOnly: "Un registro seleccionado, sin ningún tipo de registro enviado",
          exRefWrongType: "Una persona, en un campo anclado a miembros del personal",
          exRefUnknownType: "Un tipo de registro que no está registrado",
          exRefEdited: "Una identidad almacenada alterada en un carácter",
          exRefNoAccess: "Un registro de un tipo que no tienes permiso para ver",
          exRefBothBlank: "Las dos partes en blanco",

          userReferenceTitle: "UserReference",
          userReferenceStores:
            "Un puntero a una cuenta de usuario —assigned to, reviewed by, account manager—. Se representa como un selector con búsqueda sobre cuentas de usuario, y nunca muestra un control para elegir un tipo de registro, porque solo hay uno.",
          userReferenceChecks:
            "Todas las comprobaciones que hace EntityReference, más una regla más estrecha: el único tipo de registro aceptado es una cuenta de usuario. Esa lista la fija la plataforma y no la configuración, y un intento de apuntar este tipo a cualquier otra cosa se rechaza tanto al configurar una definición como al guardar un valor.",
          usrOk:
            "Aceptado, exactamente igual que un EntityReference. La respuesta se describe a sí misma de la misma manera.",
          usrDormant:
            "Aceptado. Una cuenta bloqueada está inactiva, no eliminada: sigue existiendo, el selector la sigue ofreciendo con una marca de inactiva, y es una respuesta legítima para algo que ya sucedió.",
          usrAdminRefused:
            "Rechazado, con un mensaje que indica qué está permitido. Un administrador puede no pertenecer a ningún espacio de trabajo, que es la única propiedad que un destino de referencia nunca debe tener.",
          usrGroupRefused:
            "Rechazado de la misma forma. Un grupo se puede leer con seguridad pero no es una persona, y un campo de tipo UserReference que resolviera a un grupo estaría mintiendo sobre lo que contiene.",
          usrThemeRefused:
            "Rechazado de la misma forma. Una fila de un catálogo compartido de la plataforma no pertenece a ningún espacio de trabajo y tampoco es una persona: excluida por partida doble.",
          usrEmpty: "Tratado como vacío exactamente en los mismos términos que EntityReference.",
          exUsrOk: "Una cuenta de usuario elegida del selector",
          exUsrDormant: "Una cuenta cuyo inicio de sesión está actualmente bloqueado",
          exUsrAdmin: "Un registro de administrador",
          exUsrGroup: "Un grupo de usuarios",
          exUsrTheme: "Un tema de inicio de sesión",

          groupMediaTitle: "Multimedia y texto con formato",
          mediaGroupIntro:
            "File e Image se construyen de la misma forma que los dos tipos de referencia anteriores —un puntero, no texto almacenado—, pero cada uno apunta a un único archivo subido en lugar de a otro registro. RichText es distinto otra vez: almacena contenido con formato real, redactado en el propio editor del producto.",

          fileTitle: "File",
          fileStores:
            "Un puntero a un archivo subido: una exención firmada, un certificado médico, un documento de seguro. Se representa como un pequeño control de estado que indica si hay un archivo adjunto, con un botón Clear cuando lo hay.",
          fileChecks:
            "Un valor almacenado solo se acepta cuando el archivo referenciado está realmente adjunto al registro que estás editando: una comprobación de seguridad que impide que un archivo pensado para un registro se apunte desde otro. Adjuntar un archivo nuevo desde esta pantalla todavía no está disponible: el campo se puede definir hoy, y un valor ya existente se puede consultar o borrar, pero rellenar uno por primera vez llegará en una versión futura.",
          fileAttachedExample: "Un registro cuyo campo File ya contiene un valor",
          fileAttachedOutcome:
            "Se muestra como adjunto, con un control Clear. Por ahora no hay ningún control para adjuntar junto a él.",
          fileClearExample: "Borrar un archivo adjunto y luego guardar",
          fileClearOutcome: "Aceptado: el valor se elimina.",

          imageTitle: "Image",
          imageStores:
            "El equivalente de File, restringido a imágenes: una foto de un jugador, una imagen destacada de una instalación, el escudo de un equipo. Mismo control de estado, misma limitación actual para adjuntar uno nuevo.",
          imageChecks:
            "Se comprueba lo mismo que en File, más que el archivo referenciado sea en sí una imagen. Adjuntar una imagen nueva desde esta pantalla tampoco está disponible todavía; véase File, más arriba.",
          imageAttachedExample: "Un registro cuyo campo Image ya contiene un valor",
          imageAttachedOutcome: "Se muestra como adjunto, con un control Clear.",

          richTextTitle: "RichText",
          richTextStores:
            "Prosa con formato redactada en el propio editor del producto: una nota de entrenamiento con párrafos y una lista con viñetas, un texto de política con un enlace. Se representa como un editor de texto enriquecido real, no como una caja de texto simple.",
          richTextChecks:
            "Hasta 50.000 caracteres de marcado, comprobados antes de limpiarse automáticamente: se eliminan tanto un estilo en línea como una imagen incrustada, porque el primero puede secuestrar visualmente la página que lo rodea y la segunda puede rastrear en silencio a quien vea el campo más adelante. No hay ningún aviso aparte cuando ocurre esto; vuelve a abrir el campo después y lo que ves es exactamente lo que se conservó.",
          richTextOkExample: "Un párrafo con una palabra en negrita y una lista con viñetas",
          richTextOkOutcome: "Aceptado, y se conserva cada elemento.",
          richTextStyleExample: "Contenido pegado con un estilo en línea aplicado",
          richTextStyleOutcome:
            "Aceptado, con el estilo eliminado. El texto visible y la estructura se conservan.",
          richTextImgExample: "Contenido con una imagen incrustada",
          richTextImgOutcome:
            "Aceptado, con la imagen eliminada. Una imagen pertenece en su lugar a un campo File o Image.",
          richTextTooLongExample: "Más de 50.000 caracteres de marcado",
          richTextTooLongOutcome:
            "Rechazado: VALIDATION_MAX_LENGTH — acórtalo e inténtalo de nuevo.",

          emptyTitle: "Valores vacíos y el interruptor Required",
          emptyIntro:
            "Cada tipo comparte la misma definición de vacío, y se comprueba antes que cualquier otra cosa. Un valor cuenta como vacío cuando:",
          empty1: "falta por completo en el guardado;",
          empty2: "está en blanco, o hecho solo de espacios;",
          empty3: "para MultiSelect, la lista de selecciones está explícitamente vacía;",
          empty4:
            "para DateTime, faltan tanto el instante como la zona horaria, no solo uno de los dos;",
          empty5:
            "para Currency, faltan tanto el importe como el código de moneda, no solo uno de los dos;",
          empty6:
            "para EntityReference, UserReference, File e Image, faltan las dos mitades del puntero, no solo una de ellas.",
          emptyOutcome:
            "Un valor vacío en un campo Required se rechaza con VALIDATION_REQUIRED. Un valor vacío en un campo opcional se acepta y la respuesta almacenada se borra: la fila se conserva en lugar de eliminarse, para no perder el historial.",
          emptyWarnTitle: "Rating es la excepción que conviene recordar",
          emptyWarnContent:
            "Un 0 enviado explícitamente en un campo Rating es un valor real, no vacío, y no supera la comprobación de rango de 1 a 5, exactamente igual que lo haría un 6. Solo un envío genuinamente ausente o en blanco cuenta como sin valorar. Por separado, y por la misma razón por la que un control deslizante necesita una posición, un campo Rating sin tocar aparenta situarse en 1 aun estando vacío.",

          codesTitle: "Códigos de error que puedes ver",
          codesIntro:
            "La inmensa mayoría de los rechazos son un HTTP 422 con uno de estos códigos legibles por máquina; dos de ellos son un 403 en su lugar, porque tratan sobre tu acceso y no sobre la forma de lo que enviaste. Un tercero merece señalarse aparte: su nombre de código suena a un 404, pero la respuesta sigue siendo un 422 — ver la nota junto a él más abajo. Si alguna vez ves un 500 al guardar el valor de un campo personalizado, es un defecto que merece reportarse: la ruta de validación está escrita para rechazar con limpieza, nunca para fallar.",
          thCode: "Código",
          thWhenItFires: "Cuándo se produce",
          codeRequired:
            "El campo es Required y el valor enviado está vacío o hecho solo de espacios.",
          codeInvalidFormat:
            "El valor no coincide con la forma que el tipo espera: un número, fecha u hora que no se puede interpretar, una opción que no está en la lista, un esquema de URL no permitido, una forma de teléfono incorrecta, un color hexadecimal incorrecto, un código de moneda incorrecto, o la mayoría de los fallos de validador.",
          codeInvalidEmail:
            "El valor de un campo Email no es una dirección real, o lleva un nombre para mostrar.",
          codeInvalidTimezone:
            "A un valor DateTime le falta la zona horaria una vez presente el instante, o indica una zona que el servidor no reconoce.",
          codeRange:
            "Un número está fuera de los límites de su tipo: Percent fuera de 0 a 100, Rating fuera de un 1 a 5 entero, un Duration negativo, o los límites propios de un validador Numeric Range.",
          codeMaxLength:
            "Text por encima de 4.000 caracteres, LongText por encima de 10.000, RichText por encima de 50.000, un Email o Url por encima de 4.000, más de 19 selecciones en MultiSelect, o el límite superior de un validador Length Range.",
          codeMinLength: "El límite inferior de un validador Length Range.",
          codeUnique:
            "La misma opción de MultiSelect se envió más de una vez en un mismo guardado.",
          codeUnknownEntityType:
            "Una referencia nombra un tipo de registro que no está registrado en esta instalación.",
          codeInvalidId:
            "No se pudo leer la identidad almacenada de una referencia: se alteró en algún punto del trayecto, o es un valor anterior a un cambio.",
          codeForbidden:
            "Una referencia apunta a un registro que no tienes permiso para leer. Este es un 403 y no un 422, porque trata sobre tu acceso y no sobre la forma del valor.",
          codeMediaOwnerMismatch:
            "Un valor File o Image apunta a un archivo que no está adjunto al registro que estás editando. Este también es un 403, por el mismo motivo que el caso Forbidden de la referencia anterior: trata sobre la propiedad, no sobre la forma.",
          codeMediaNotFound:
            "El id de un valor File o Image no se puede descifrar, o se descifra en un archivo que ya no existe. El nombre del código suena a un 404, pero la respuesta es un 422: la misma forma que usa cualquier otro rechazo por valor mal formado de esta página, no la forma de «no encontrado» que un cliente podría esperar por el nombre.",
          codeMediaNotAnImage:
            "El valor de un campo Image apunta a un archivo que no es una imagen.",
          codeRichTextShape:
            "El valor de un campo RichText no se envió como un objeto con una propiedad 'html'.",
          codesInfoTitle: "Los mensajes nombran la clave, no la etiqueta",
          codesInfoContent:
            "Los mensajes de error citan la clave técnica del campo —'shirt_size'— y no su etiqueta visible. Si estás relacionando un mensaje con un campo, hazlo por la clave.",

          catalogueTitle: "La pantalla Value Types en el producto",
          catalogueIntro:
            "El producto lleva su propio catálogo de solo lectura de estos tipos, al que se llega desde un enlace en el encabezado de la página Custom Fields. Es documentación, no configuración: nada en ella se puede añadir, editar ni eliminar, porque los tipos de valor los fija la plataforma. Está protegida por el mismo permiso que la propia pantalla Custom Fields, y está completamente traducida, de derecha a izquierda incluido.",
          catalogueColumns:
            "Cada fila muestra el nombre del tipo, una descripción de para qué sirve, si admite un texto de sugerencia, si tiene una lista de opciones propia, y si admite un validador. Text es la única fila que muestra compatibilidad con validador; ese es el límite exclusivo de Text hecho visible.",
          catalogueNoPlanColumn:
            "Deliberadamente no hay ninguna columna de plan o de derechos de uso en esa pantalla. Los tipos de valor no están sujetos individualmente a restricciones de plan, así que una columna que sugiriera lo contrario estaría mostrando algo que no existe.",
        },

        // ═══════════════════════════════════════════════════
        //  Reference Fields
        // ═══════════════════════════════════════════════════
        references: {
          title: "Campos de Referencia",
          description:
            "Los dos tipos de valor que apuntan a un registro de otro módulo —Entity Reference y User Reference—: cuál usar, qué se almacena realmente, por qué el nombre nunca se guarda con él, cómo se fija un tipo de destino, qué se puede referenciar y las reglas de espacio de trabajo.",
          intro:
            "Cualquier otro tipo de valor almacena algo que tú escribiste. Estos dos almacenan un puntero: el campo no contiene texto propio, solo la identidad de otro registro en otra parte del producto. Un campo en un registro de administrador que indica de qué miembro del personal se trata, un campo en una reserva que indica quién la revisó, un campo en una persona que indica qué gestor de cuenta se ocupa de ella: los tres casos son un registro que apunta a otro, y hasta que existieron estos tipos no había forma de registrarlo sin volver a escribir un nombre y verlo desincronizarse con el tiempo.",
          oneLineTitle: "En una frase",
          oneLineContent:
            "Un campo de referencia almacena qué registro elegiste, nunca cómo se llamaba ese registro, así que el nombre que ves es siempre el nombre que tiene ese registro ahora mismo, y siempre uno que tienes permiso para ver.",

          whatTitle: "Qué te da un campo de referencia",
          whatIntro:
            "Una referencia no es un campo de texto que resulta que contiene el nombre de alguien. Es un puntero real, comprobado al guardarlo y vuelto a comprobar cada vez que se lee, y cuanto sigue se deriva de eso.",
          featPointsAt: "Apunta a un registro real",
          featPointsAtDesc:
            "Eliges de una lista con búsqueda de registros que realmente existen, en tu propio espacio de trabajo, en lugar de escribir un nombre y confiar en que coincida. No se almacena nada hasta que se ha elegido un registro real.",
          featLiveName: "Siempre muestra el nombre actual",
          featLiveNameDesc:
            "El nombre se busca de nuevo cada vez que se muestra el campo. Cuando se corrige el nombre de alguien en su propio registro, cada referencia que apunta a esa persona muestra la corrección de inmediato: no hay ninguna copia que pueda quedar desactualizada.",
          featPermission: "Lleva consigo los permisos propios del destino",
          featPermissionDesc:
            "Leer el nombre necesita permiso para ver ese tipo de registro, no permiso para ver el registro que contiene el campo. Alguien que puede editar el registro propietario pero no puede leer personal ve que hay una referencia establecida y no ve a quién apunta.",
          featSearch: "Con búsqueda, paginado, y te dice lo que no puede hacer",
          featSearchDesc:
            "El selector busca en los propios registros del módulo destino una página cada vez, marca un registro inactivo como tal en lugar de ocultarlo, y explica con palabras cuándo no hay nada a lo que tengas permiso de apuntar, nunca un desplegable vacío que se lea como «no hay registros».",
          featPinned: "Se puede anclar a un tipo de registro",
          featPinnedDesc:
            "Un campo Entity Reference se puede anclar de modo que cada valor deba apuntar, por ejemplo, a un miembro del personal, o dejarse sin anclar, en cuyo caso cada valor elige su propio tipo de registro y registra esa elección junto con el puntero.",
          featSelfHealing: "Se borra sola cuando se elimina el destino",
          featSelfHealingDesc:
            "Elimina el registro al que apunta una referencia y el puntero se borra automáticamente. La propia fila de valor sobrevive con su historial de auditoría; solo desaparece el puntero, y no hay que ordenar nada a mano.",

          whichTitle: "Entity Reference o User Reference",
          whichIntro:
            "Hay dos tipos de valor de referencia y son mecánicamente casi idénticos. La diferencia está por completo en a qué puede apuntar cada uno, y por tanto en cuánto tienes que configurar. Elige User Reference siempre que la respuesta sea «una persona que inicia sesión»; elige Entity Reference para cualquier otro caso.",
          thAspect: "Aspecto",
          thEntityRef: "Entity Reference",
          thUserRef: "User Reference",
          aspTargets: "A qué puede apuntar",
          entTargets:
            "A cualquier tipo de registro que la plataforma pueda resolver actualmente y que tengas permiso para ver.",
          usrTargets:
            "A exactamente un tipo de registro: una cuenta de usuario. No se acepta nada más, nunca, y esa lista la fija la plataforma y no la configuración.",
          aspConfig: "Qué configuras",
          entConfig:
            "Opcionalmente, un Target Entity Type en la definición. Dejarlo sin anclar es una opción real y permanentemente admitida, no una que quede a medias.",
          usrConfig:
            "Nada en absoluto. No hay ningún selector de destino en el formulario de definición para este tipo, porque no hay ninguna decisión que tomar.",
          aspPicker: "Qué ve la persona que lo rellena",
          entPicker:
            "En un campo anclado, una lista con búsqueda de ese tipo de registro. En un campo sin anclar, dos controles: primero el tipo de registro, luego el registro.",
          usrPicker: "Una lista con búsqueda de cuentas de usuario. Nunca hay un control de tipo.",
          aspUse: "Recurre a él cuando",
          entUse:
            "La respuesta es un registro de negocio —un miembro del personal, una persona, una instalación— o cuando distintos registros bajo el mismo campo apuntan legítimamente a tipos de cosas diferentes.",
          usrUse:
            "La respuesta es una cuenta: assigned to, reviewed by, account manager, approved by.",
          aspStorage: "Cómo se almacena la respuesta",
          entStorage:
            "El tipo de registro, más la identidad propia de ese registro. Los dos, siempre juntos.",
          usrStorage:
            "De forma idéntica. El valor almacenado se describe a sí mismo exactamente de la misma manera, que es lo que mantiene legible una respuesta antigua después de que cambie la definición.",
          whichInfoTitle: "Por qué son dos tipos y no un ajuste",
          whichInfoContent:
            "La lista de cosas a las que puede apuntar un User Reference es una decisión de seguridad, así que la fija la plataforma en lugar de que un administrador la escriba en una definición. Y como el tipo se registra en cada respuesta almacenada, la pregunta «¿cuáles de nuestros campos guardan referencias a personas?» tiene respuesta incluso para valores cuya definición se ha cambiado desde entonces. Un único tipo con un ajuste habría perdido las dos propiedades.",

          storedTitle: "Qué se almacena realmente",
          storedIntro:
            "Un valor de referencia son dos partes, unidas. Es la misma forma que usa Currency para su importe y su código, y por el mismo motivo: ninguna de las dos partes significa nada por sí sola.",
          thPiece: "Parte",
          thWhat: "Qué es",
          thRequired: "¿Obligatoria?",
          pieceTypeName: "El tipo de registro",
          pieceIdName: "La identidad del registro",
          pieceTypeKey:
            "El tipo de registro al que se apunta, como identificador estable; por ejemplo, hrms.staff-member. Se almacena en la propia respuesta, no se consulta a partir de la definición.",
          pieceTypeKeyRequired: "Sí, siempre, en cada respuesta",
          pieceId: "La identidad del registro concreto al que se apunta, como una cadena opaca.",
          pieceIdRequired: "Sí, siempre, en cada respuesta",
          storedNeither:
            "Una identidad sin tipo de registro nombra una fila pero no una tabla; un tipo de registro sin identidad nombra una tabla pero no una fila. Así que un valor se trata como vacío solo cuando faltan las dos partes —exactamente como se comportan Currency y Date & Time—, y media referencia se rechaza en lugar de almacenarse o borrarse en silencio. Si alguna vez ves un guardado rechazado por una referencia incompleta, es que uno de los dos controles se dejó de lado.",
          storedIdsTitle: "La identidad es opaca, y debe seguir siéndolo",
          storedIdsContent:
            "La identidad del registro destino nunca viaja como una clave de base de datos legible. Llega como una cadena cifrada, y cualquier cosa que lea o escriba una referencia debe devolver exactamente la cadena que recibió: sin cambios, sin recortes, sin convertir a minúsculas, sin compararla con ningún patrón. Altera un carácter y el producto informa correctamente de que la referencia almacenada es incorrecta, sobre una referencia que un momento antes era perfectamente válida. No hay nada en esa cadena para que lea una persona, ni nada que merezca la pena intentar leer.",
          storedSymmetryTitle: "Los mismos dos nombres en ambas direcciones",
          storedSymmetryContent:
            "Una referencia se escribe bajo los mismos dos nombres de propiedad con los que se lee: entityTypeKey y entityId. No hay una segunda forma de escribirlo al subir los datos, ni otra al bajarlos. Si estás integrando contra la API de valores, devuelve exactamente los nombres de campo que se te dieron; inventar un nombre distinto para la identidad al enviarla no es una preferencia de escritura, es un guardado que en silencio no lleva ningún puntero y que después se rechaza como una referencia incompleta.",

          nameTitle: "Por qué el nombre para mostrar nunca se almacena",
          nameIntro:
            "El diseño obvio sería guardar el nombre junto a la identidad, para poder mostrar una referencia sin preguntarle nada a nadie. El producto deliberadamente no hace eso, y el motivo es un límite de permisos, no una preferencia sobre la actualidad del dato.",
          nameWhy:
            "Un nombre guardado junto al puntero quedaría dentro del registro que contiene el campo, y por tanto sería legible por cualquiera que tenga permiso para ver ese registro. Pero el nombre pertenece al destino: lo protege el permiso que protege a ese tipo de registro. Guardar una instantánea del nombre le entrega ese nombre a alguien a quien nunca se le concedió el permiso que lo protege. Eso es una elusión de permisos disfrazada de argumento de rendimiento, y ninguna cantidad de caché lo convierte en otra cosa.",
          nameCost:
            "Así que un nombre se resuelve en vivo, en cada lectura, mediante una llamada que vuelve a aplicar el permiso de visualización propio del destino y el propio filtro de espacio de trabajo del módulo destino cada vez. El beneficio práctico es justo el que querrías en cualquier caso: un nombre corregido en su propio registro queda corregido en cada sitio donde se referencia, al instante, sin nada que volver a ejecutar y sin copias desactualizadas que rastrear.",
          nameInfoTitle: "Lo que notarás como consecuencia",
          nameInfoContent:
            "Dos cosas, ambas intencionadas. Un campo de referencia muestra un breve estado de carga mientras se obtiene su nombre, en lugar de aparecer al instante con un texto que luego se corrige. Y dos personas que miran el mismo registro pueden legítimamente ver cosas distintas en el mismo campo: una, el nombre del miembro del personal; la otra, una nota de que puede ver que hay una referencia pero no a quién apunta. Ninguna de las dos cosas es un fallo.",

          pinTitle: "Anclar un tipo de destino en la definición",
          pinIntro:
            "Una definición de Entity Reference lleva un ajuste propio y opcional: Target Entity Type. Responde a «¿a qué tipo de registro puede apuntar este campo?», y solo se ofrece para Entity Reference; un campo User Reference nunca lo muestra, porque su respuesta ya está fijada.",
          thState: "Estado del ajuste",
          thMeans: "Qué significa",
          thPickerShows: "Qué muestra entonces el formulario del registro",
          stateUnpinned: "Sin anclar — cualquier tipo permitido",
          meansUnpinned:
            "Cada respuesta puede apuntar a cualquier tipo de registro que la persona que la rellena tenga permiso de referenciar, y cada respuesta registra qué tipo eligió. Este es el estado en el que empieza una definición recién creada, y sigue siendo válido para siempre.",
          pickerUnpinned:
            "Dos controles en orden: un control Record type, y luego el propio registro. El segundo está inerte hasta que se responde al primero, y elegir un tipo no mueve el cursor al control del registro; te quedas donde estabas, con el control del registro ya disponible.",
          statePinned: "Anclado a un tipo",
          meansPinned:
            "Toda respuesta nueva debe apuntar a un registro de ese único tipo. Una respuesta de cualquier otro tipo se rechaza con un mensaje que indica tanto lo que se esperaba como lo que llegó.",
          pickerPinned: "Un control: el registro. No hay ningún control de tipo.",
          stateUserRef: "Un campo User Reference",
          meansUserRef:
            "Permanentemente equivalente a estar anclado a cuentas de usuario, decidido por la plataforma. Un intento de anclarlo a cualquier otra cosa se rechaza al definirlo, no al guardar un valor.",
          pickerUserRef: "Un control: la cuenta de usuario. Nunca hay un control de tipo.",
          pinRepoint:
            "El ajuste se puede cambiar más adelante, incluso en un campo que ya tiene respuestas, y esto es deliberado: negarlo significaría que un campo mal anclado nunca podría corregirse sin destruir antes datos reales. Merece la pena decir con exactitud qué ocurre, porque las dos mitades importan: cada respuesta ya almacenada se deja completamente intacta y se sigue leyendo correctamente, porque cada respuesta lleva su propio tipo de registro. El siguiente guardado de un registro cuya respuesta sea del tipo antiguo se rechaza, hasta que alguien vuelva a elegir esa respuesta.",
          pinRepointDetail:
            "El formulario de edición lo indica antes de que guardes. Lee esa línea en lugar de suponer cualquiera de los dos extremos: volver a anclar no es ni gratis ni destructivo.",
          pinWarnTitle: "Una consecuencia de volver a anclar que conviene comprobar",
          pinWarnContent:
            "Un campo sin anclar que ya tiene una respuesta no ofrece ningún control de tipo mientras esa respuesta esté en su sitio, porque en su lugar se usa el propio tipo de registro de la respuesta. Volver a elegir queda por tanto limitado al tipo de registro al que ya apunta. Borra el campo y el control de tipo vuelve a aparecer. Este es un límite real y no un defecto, y es la forma de esta funcionalidad con más probabilidades de reportarse como uno.",

          targetsTitle: "Qué se puede referenciar actualmente",
          targetsIntro:
            "La lista no es «cualquier tipo de registro del producto». Un tipo de registro solo se puede referenciar cuando el módulo propietario ofrece una forma de buscar y resolver sus registros, leyendo sus propios datos con las reglas de sus propias pantallas, así que un selector nunca puede ser más amplio que la pantalla que refleja. Hoy hay seis tipos de registro que lo ofrecen; los tres últimos se sumaron a los tres primeros en una versión posterior.",
          thType: "Tipo de registro",
          thKey: "Identificador",
          thOwner: "Propiedad de",
          thShows: "Qué muestra el selector en cada fila",
          typeStaff: "Staff Member",
          keyStaff: "hrms.staff-member",
          ownerStaff: "El módulo de gestión de personal",
          showsStaff:
            "El nombre de la persona, con su puesto debajo como elemento para distinguirla. Deliberadamente el puesto y no una dirección de correo: un selector necesita distinguir a dos personas con el mismo nombre, y no necesita sus datos de contacto para hacerlo.",
          typeUser: "User",
          keyUser: "identity.user",
          ownerUser: "El módulo de identidad",
          showsUser:
            "El nombre del titular de la cuenta, con el nombre de usuario debajo. Una cuenta cuyo inicio de sesión está actualmente bloqueado se muestra como inactiva pero se puede seguir seleccionando.",
          typePerson: "Party Person",
          keyPerson: "party.person",
          ownerPerson: "El módulo de terceros y relaciones",
          showsPerson:
            "Solo el nombre de la persona. El módulo propietario no aporta ninguna segunda línea, al considerar que cualquier cosa que pudiera añadir sería un dato personal que un selector no necesita.",
          typeAdmin: "Administrator",
          keyAdmin: "identity.admin",
          ownerAdmin: "El módulo de identidad",
          showsAdmin:
            "El nombre del administrador, que recurre al nombre de usuario cuando ambas partes del nombre están vacías, con el nombre de usuario como segunda línea. Deliberadamente nunca la dirección de correo, el teléfono, los nombres de rol, ni si la fila es Super Admin: la más restringida de las tres filas de tipo persona de esta lista, porque un registro de administrador es lo más sensible a lo que puede apuntar este punto de conexión.",
          typeTeam: "Team",
          keyTeam: "organization.team",
          ownerTeam: "El módulo de organización",
          showsTeam:
            "Solo el nombre del equipo, sin segunda línea. Hoy, dos equipos que comparten nombre en departamentos distintos se muestran de forma idéntica: el departamento que los distinguiría no está en la fila de este selector.",
          typeBranch: "Branch",
          keyBranch: "organization.branch",
          ownerBranch: "El módulo de organización",
          showsBranch:
            "El nombre de la sucursal, con su zona horaria debajo como elemento para distinguirla: el mismo motivo por el que dos sucursales llamadas ambas «Main» se distinguen entre sí en la propia pantalla de sucursales.",
          targetsRefused:
            "Cualquier otra cosa se rechaza en lugar de responderse con una lista vacía, y ahí radica precisamente la clave: una lista vacía parece un resultado normal y le diría a un administrador «no hay miembros del personal», una afirmación falsa con apariencia de correcta. Un tipo de registro para el que la plataforma no puede responder produce en su lugar un rechazo claro, que el formulario del registro representa como una frase que indica que ese tipo de registro no está disponible en esta instalación.",
          targetsEmpty:
            "Y una lista de tipos disponibles genuinamente vacía es en sí misma una respuesta legítima, no un fallo. Significa «no hay nada a lo que puedas apuntar una referencia», lo que ocurre por dos motivos bastante distintos: los módulos propietarios de esos registros pueden no formar parte de esta instalación, o puede que no tengas acceso de visualización a ninguno de ellos. El producto nombra las dos posibilidades sin afirmar ninguna, porque solo una de ellas se soluciona pidiendo permisos.",
          targetsWhyNot:
            "Dos tipos de registro que parecen pertenecer a esa lista y se excluyen a propósito (los registros de administrador solían ser un tercero, hasta que una versión posterior les dio su propio proveedor de búsqueda; ahora están en la tabla de arriba, no aquí):",
          targetsWhyNotGroup:
            "Los grupos de usuarios. Perfectamente seguros de leer, y simplemente no son una persona. Un campo de tipo User Reference que resolviera a un grupo estaría mintiendo sobre lo que contiene.",
          targetsWhyNotTheme:
            "Las filas de catálogos compartidos de la plataforma, como los temas de inicio de sesión. No pertenecen a ningún espacio de trabajo por diseño, así que no superan la misma prueba que no superan los registros de administrador, y tampoco son personas.",
          targetsInfoTitle: "La lista que ves es la lista que puedes usar",
          targetsInfoContent:
            "Los tipos disponibles se filtran antes de llegar a ti: registrados, resolubles por esta instalación, y permitidos para ti. Toda entrada que se te ofrece funcionará cuando la uses, y nada de lo que se te ofrece te va a rechazar en el siguiente clic. Por eso la lista se obtiene cuando abres el control y no cuando carga el formulario: un formulario de registro con varios campos de referencia que nadie toca no le pide nada a los demás módulos.",

          tenantTitle: "Reglas de espacio de trabajo y de plataforma",
          tenantIntro:
            "Las referencias cruzan un límite entre módulos, lo que hace del límite de espacio de trabajo algo que hay que precisar. Cinco reglas, todas ellas exigidas y no meramente orientativas.",
          tenant1:
            "Aquí no queda nada sin proteger por espacio de trabajo. Tanto buscar un registro como resolver uno que ya tienes se leen a través del propio repositorio del módulo propietario, así que se aplican el mismo filtro de espacio de trabajo y el mismo filtro de registros eliminados que se aplican en las pantallas propias de ese módulo. Solo puedes apuntar a registros que tu espacio de trabajo ya pueda ver.",
          tenant2:
            "Tener una identidad no es un permiso. Una referencia se vuelve a autorizar en cada lectura: se exige de nuevo el permiso de visualización propio del destino, cada vez, y el hecho de que el puntero ya esté almacenado no cuenta para nada.",
          tenant3:
            "El registro de otro espacio de trabajo y un registro eliminado son una única respuesta indistinguible, a propósito. Si se pudieran distinguir, alguien podría probar identidades una a una para averiguar qué existe en un espacio de trabajo que no puede ver. «No tienes permiso para ver este tipo de registro» se distingue de «este registro ya no existe», porque esas dos cosas tienen soluciones opuestas y ninguna revela nada.",
          tenant4:
            "Los registros a nivel de plataforma pertenecen a los administradores de la plataforma. Un campo personalizado creado a nivel de plataforma lo hereda cada espacio de trabajo y solo un administrador de la plataforma puede crearlo, editarlo o eliminarlo, incluido el tipo de destino anclado en un campo de referencia a nivel de plataforma, que ningún espacio de trabajo puede cambiar.",
          tenant5:
            "Nadie puede asignar un administrador fuera de su propio espacio de trabajo. En la práctica el producto va más allá de lo que exige la regla: un registro de administrador no se puede referenciar en absoluto desde un campo de referencia, ni en tu propio espacio de trabajo ni en ningún otro, precisamente porque un administrador puede situarse fuera de cualquier espacio de trabajo.",
          tenantWarnTitle: "Una cosa que esto no hace",
          tenantWarnContent:
            "Una referencia es tan estricta como la propia pantalla de listado del destino, y no más. Si un tipo de registro es visible para un rol a través de su propia pantalla, se puede seleccionar a través de un selector para ese mismo rol; no se aplican por encima reglas más estrechas que «este espacio de trabajo entero». Así que no trates un selector de referencia como una forma de ocultar registros que el propio módulo destino ya muestra.",

          exampleTitle:
            "Un ejemplo completo: un registro de administrador que apunta a un miembro del personal",
          exampleIntro:
            "El caso para el que se construyeron estos tipos. Tus administradores también son empleados, y quieres que cada registro de administrador indique qué registro de personal es la misma persona: registrado una vez, correctamente, y nunca vuelto a escribir.",
          ex1Title: "Decide qué tipo necesitas",
          ex1Content:
            "La respuesta es un miembro del personal, no una cuenta de acceso, así que esto es un Entity Reference. Si la pregunta hubiera sido «¿quién revisó esto?», la respuesta sería una cuenta y User Reference sería la opción correcta; y el tipo de valor es permanente, así que merece un momento de reflexión.",
          ex2Title: "Define el campo",
          ex2Content:
            "En la pantalla Custom Fields elige Add, selecciona el tipo de registro de administrador, pon la clave staff_record, la etiqueta en inglés Staff record, y el tipo de valor Entity Reference. Un control Target Entity Type aparece en cuanto eliges ese tipo de valor.",
          ex3Title: "Ancla el destino a Staff Member",
          ex3Content:
            "Pon Target Entity Type en Staff Member. Eso es lo que convierte el campo de «un puntero a algo» en «un puntero a un miembro del personal», y lo que permite que el formulario del registro muestre un control en lugar de dos. Déjalo como Not pinned solo si de verdad quieres que distintos administradores apunten a distintos tipos de registro.",
          ex4Title: "Rellénalo en un registro",
          ex4Content:
            "Abre cualquier registro de administrador. La sección Custom Fields muestra ahora un control Staff record con un texto de sugerencia que invita a seleccionar un registro. Ábrelo, escribe parte de un nombre, y la lista se reduce a los miembros del personal que coinciden, con su puesto debajo. Elige uno y guarda el registro.",
          ex5Title: "Vuelve a consultarlo, y fíjate en lo que ha pasado",
          ex5Content:
            "Vuelve a abrir el registro. El campo muestra el nombre del miembro del personal, obtenido justo ahora, no recordado de tu guardado. Cambia el apellido de esa persona en su propio registro de personal, vuelve, y la referencia muestra el nuevo apellido sin que nadie haya tocado el registro de administrador.",
          ex6Title: "Comprueba los dos comportamientos que importan",
          ex6Content:
            "Inicia sesión como alguien que puede editar administradores pero no puede ver personal: el campo está presente, indica que el valor almacenado es correcto y que no puede ver el nombre, y no puede sobrescribirlo. Después elimina al miembro del personal: la referencia se borra sola, el registro de administrador conserva su fila de valor y su historial, y el campo se lee como vacío en lugar de como un puntero roto.",

          userExampleTitle: "Un ejemplo completo: un campo Reviewed by",
          userExampleIntro:
            "El caso de User Reference, que es más breve precisamente porque no hay nada que configurar.",
          ux1Title: "Define el campo",
          ux1Content:
            "Añade un campo en el tipo de registro que quieras, pon la clave reviewed_by, la etiqueta Reviewed by, y el tipo de valor User Reference. No aparece ningún control de destino, y eso es correcto: la respuesta solo puede ser una cuenta de usuario.",
          ux2Title: "Rellénalo",
          ux2Content:
            "Abre un registro de ese tipo. El control Reviewed by ofrece una lista con búsqueda de cuentas de usuario, cada una con su nombre de usuario debajo del nombre. Las cuentas actualmente bloqueadas se marcan como inactivas y se pueden seguir seleccionando, porque son respuestas legítimas para algo que ya sucedió.",
          ux3Title: "Confirma qué almacena",
          ux3Content:
            "La respuesta registra el tipo de cuenta de usuario y la identidad de esa cuenta: las mismas dos partes que almacena un Entity Reference, así que un campo que dice User Reference te está contando qué contiene y no solo cómo se configuró.",
          ux4Title: "Confirma qué rechaza",
          ux4Content:
            "No hay forma, ni desde este formulario ni desde una solicitud que lo evite, de hacer que este campo apunte a un administrador, un grupo de usuarios o una fila de catálogo de la plataforma. El rechazo llega con un mensaje que indica qué está permitido, y se produce tanto al definir el campo como al guardar un valor.",

          notTitle: "Qué no son los campos de referencia",
          notIntro:
            "Expectativas razonables que estos tipos deliberadamente no cumplen. Ninguna de ellas es un fallo que reportar.",
          not1: "No son una relación que el producto entienda. No se calcula nada a partir de una referencia, nada se dispara por ella, y ninguna pantalla gana una lista de «registros que apuntan a este» por el hecho de que exista una referencia.",
          not2: "No son una forma de ocultar registros. Un selector muestra exactamente lo que las propias pantallas del módulo destino muestran a esa misma persona. Si alguien no debería ver un tipo de registro, eso es un permiso sobre ese tipo de registro.",
          not3: "No almacenan un nombre, nunca, y no hay ningún ajuste para hacer que lo hagan. Un campo que deba sobrevivir a que se elimine el destino con el nombre antiguo todavía legible es un campo Text, y aceptar que se desactualizará es el precio de esa elección.",
          not4: "No son de muchos a muchos. Un campo de referencia contiene un puntero. No existe un tipo de referencia multivalor, y Multi-Select no puede apuntar a registros: sus respuestas son texto que tú redactaste.",
          not5: "No pueden apuntar a cualquier tipo de registro. Solo se pueden referenciar los tipos cuyo módulo propietario ofrece una lista con búsqueda y comprobación de permisos, y el resto se rechazan en lugar de ofrecerse en silencio.",
          not6: "No se incluyen en la exportación a hoja de cálculo de las definiciones. Ese archivo tiene dieciocho columnas y un tipo de destino anclado no es una de ellas, así que una definición exportada no registra a qué apunta su campo.",

          nextTitle: "Dónde seguir",
          nextIntro:
            "La mecánica de buscar una referencia —las tres búsquedas, cada estado de fallo, y qué hacer en cada caso— está en su propia página.",
          thPage: "Página",
          thCovers: "Qué cubre",
          pageLookups: "Búsquedas de Referencia",
          coversLookups:
            "Las tres búsquedas que hay detrás de una referencia, qué significa cada respuesta y cada rechazo, los cinco estados de fallo y de quién es el problema en cada caso, el comportamiento al eliminar, y cómo pagina el selector.",
          pageValueTypes: "Tipos de Valor",
          coversValueTypes:
            "Los veintidós tipos de valor uno junto a otro, incluidos estos dos, con ejemplos de entradas resueltos y el código de error que devuelve cada rechazo.",
          pageDefining: "Definir un Campo",
          coversDefining:
            "El formulario de definición control por control, incluido el control Target Entity Type y cada rechazo que puede producir.",
        },

        // ═══════════════════════════════════════════════════
        //  Reference Lookups
        // ═══════════════════════════════════════════════════
        referenceLookups: {
          title: "Búsquedas de Referencia",
          description:
            "Cómo se busca una referencia: las tres búsquedas que hay detrás de un campo de referencia, qué significa cada respuesta, los cinco estados de fallo y de quién es el problema en cada caso, qué ocurre cuando se elimina el registro referenciado, y cómo se comporta el selector.",
          intro:
            "Un campo de referencia se construye con tres búsquedas independientes: una pregunta a qué tipos de registro puedes apuntar, otra busca dentro de un tipo elegido, y otra resuelve un puntero que ya tienes de vuelta a un nombre. Esta página cubre las tres, cada respuesta que puede dar cada una, y —la parte que conviene leer antes de que algo salga mal— qué significa cada tipo de fallo y quién puede solucionarlo.",
          whyThreeTitle: "Por qué el nombre llega por separado",
          whyThreeContent:
            "Los propios valores del registro se leen en una llamada; el nombre de cada referencia se resuelve después en la suya propia. Eso no es un descuido. Resolver un nombre está protegido por el permiso propio del destino, así que tiene que ser una lectura comprobada con su propio permiso, y hacerlo en línea supondría una consulta entre módulos por referencia y por fila, que en una lista de registros equivale a una consulta por celda.",

          endpointsTitle: "Las tres búsquedas",
          endpointsIntro:
            "Las tres viven bajo una dirección propia en lugar de junto a las demás llamadas de campos personalizados, y eso es deliberado: leen datos de otros módulos, así que están protegidas por el permiso de visualización propio del tipo de registro destino y no por el permiso para administrar definiciones de campos. A alguien que administra campos personalizados pero no puede leer personal se le rechaza aquí, correctamente.",
          endpointsTypes:
            "Lista los tipos de registro a los que quien llama puede apuntar en este momento.",
          endpointsSearch:
            "Devuelve una página de registros seleccionables de un tipo, con filtro opcional.",
          endpointsResolve:
            "Resuelve un puntero que quien llama ya tiene, de vuelta a su registro.",
          endpointsPermission:
            "Así que no hay un único permiso que abra esta funcionalidad. Las tres exigen haber iniciado sesión como administrador, y cada una exige además el permiso de visualización del tipo de registro que aparece en la dirección: listar miembros del personal necesita el permiso de visualización de personal, listar cuentas de usuario necesita el de cuentas de usuario. La consecuencia esperable es que la misma persona puede ser admitida por una de estas búsquedas y rechazada por la siguiente, en la misma pantalla, y las dos respuestas son correctas.",

          typesTitle: "Listar a qué puedes apuntar",
          typesWhat:
            "Esto responde con el conjunto filtrado, no con el catálogo completo: registrado, resoluble por esta instalación, y permitido para ti. Cada entrada que devuelve se puede usar de inmediato, que es la razón entera de su existencia; un control que ofreciera cualquier tipo de registro registrado estaría ofreciendo opciones que te rechazarían en el siguiente clic, y la alternativa de probarlas una a una es un puñado de denegaciones por carga de página.",
          typesEmpty:
            "Una lista vacía es un éxito, no un fallo. Significa «no puedes apuntar una referencia a nada», y se muestra como una frase explicativa dentro del control en lugar de como un error o como un desplegable vacío en silencio. Tiene dos causas posibles y el producto nombra las dos sin afirmar ninguna: los módulos propietarios pueden no formar parte de esta instalación, o puede que no tengas acceso de visualización a ellos. Solo la segunda se soluciona pidiendo permisos, por lo que un texto que nombrara una sola causa mandaría a alguien a hacer algo que no puede funcionar.",
          typesShape:
            "Cada entrada lleva su identificador estable, el módulo que la posee, y un nombre para mostrar en inglés y en árabe. Esos nombres proceden del propio registro de la plataforma y no de las traducciones de esta aplicación, así que se muestran tal como se suministran y nunca se buscan como claves de traducción.",

          searchTitle: "Buscar dentro de un tipo de registro",
          searchWhat:
            "Una página de registros seleccionables, en un orden estable, con un filtro de texto libre opcional. Qué columnas coinciden con el filtro es decisión del módulo propietario y no una promesa hecha aquí.",
          searchPaging:
            "Una página contiene veinte filas por defecto. Pedir más de cien se limita en silencio en lugar de rechazarse, y el orden es estable entre llamadas a propósito: un orden inestable haría que la página dos devolviera filas que ya viste en la página uno. El control carga la primera página, y luego va acumulando páginas adicionales tras un control Load more en lugar de reemplazar lo que estabas viendo.",
          searchRows:
            "Cada fila lleva un nombre para mostrar que nunca está en blanco, una segunda línea opcional para distinguir dos registros con nombres parecidos, y una marca que indica si el registro está inactivo. Los registros eliminados no se devuelven en absoluto, así que esa marca nunca significa eliminado: una fila inactiva está presente, se puede seleccionar, y es una respuesta perfectamente válida.",
          searchTyping:
            "La escritura se retrasa deliberadamente antes de convertirse en una solicitud. Sin eso, un nombre de ocho caracteres dispararía ocho consultas entre módulos, siete de cuyas respuestas se descartarían, y la que se mostraría sería la que llegara en último lugar y no la que coincidiera con lo que escribiste.",

          resolveTitle: "Resolver un puntero que ya tienes",
          resolveWhat:
            "La mitad de lectura de la funcionalidad, y la única forma en que una referencia almacenada llega a convertirse en un nombre en pantalla. Toma el tipo de registro y la identidad, y devuelve exactamente la misma forma que tiene una fila del selector, así que una referencia cargada de la base de datos y un registro que acabas de elegir se construyen a partir de un único contrato y no de dos.",
          resolveGates:
            "Aplica los mismos controles que aplica la búsqueda: el tipo de registro debe estar registrado, debes tener el permiso de visualización propio de ese tipo, esta instalación debe poder responder por él, y el registro se lee a través del repositorio del módulo propietario, filtrado por espacio de trabajo y por registros eliminados. El hecho de que esta sea una lectura solo para mostrar no relaja ninguno de ellos.",
          resolveNoName:
            "Es también el único sitio del que procede un nombre. Nada en una referencia almacenada incluye un nombre, por diseño, así que un campo que no puede resolverse muestra una frase concreta sobre el motivo, nunca un nombre que recordara de antes.",

          statusesTitle: "Qué significa cada respuesta",
          statusesIntro:
            "Las respuestas son deliberadamente distinguibles entre sí, con exactamente una fusión conservada. Lee esta tabla como el mapa entre lo que te dice el producto y lo que deberías hacer al respecto.",
          thAnswer: "Respuesta",
          thWhatItMeans: "Qué significa",
          thWhoFixes: "De quién es el problema",
          ansOk: "Éxito",
          ansOkMeans:
            "El registro se resolvió. Obtienes su nombre actual, su segunda línea opcional, y si está inactivo.",
          ansOkFixes: "De nadie: es el caso normal.",
          ansForbidden: "No permitido",
          ansForbiddenMeans:
            "No tienes el permiso de visualización para ese tipo de registro. Esto no dice absolutamente nada sobre el registro, ni sobre si sigue existiendo.",
          ansForbiddenFixes:
            "De quien administre los roles. Es un hecho sobre tu propio acceso, y ya podrías haberlo sabido leyendo tus propios permisos.",
          ansNotFound: "No encontrado",
          ansNotFoundMeans:
            "El registro no se resuelve. Se eliminó, o pertenece a un espacio de trabajo que no puedes ver; fusionado en una sola respuesta a propósito para que esta búsqueda no se pueda usar para averiguar qué existe en otro sitio.",
          ansNotFoundFixes:
            "De quien sea propietario de los datos. Elige otro registro, o borra el campo.",
          ansUnknownType: "Tipo de registro desconocido",
          ansUnknownTypeMeans:
            "El tipo de registro indicado no está registrado en absoluto. Esto describe la instalación, no ningún registro; suele significar que un campo se ancló a un tipo de registro que desde entonces se ha retirado.",
          ansUnknownTypeFixes: "De quien administre el despliegue.",
          ansUnavailable: "Módulo no disponible",
          ansUnavailableMeans:
            "El tipo de registro está registrado pero el módulo que lo posee no forma parte de esta instalación, así que nada aquí puede responder por él. Ninguna concesión de permisos cambiará esto jamás.",
          ansUnavailableFixes: "De quien administre el despliegue.",
          ansInvalidId: "Identidad no válida",
          ansInvalidIdMeans:
            "La identidad enviada no se pudo leer en absoluto. O se alteró en algún punto del trayecto, o es un valor almacenado anterior a un cambio y ya no se puede interpretar.",
          ansInvalidIdFixes:
            "De quien esté rellenando el registro: vuelve a elegir el registro. Este caso se reemplaza, nunca se vuelve a anclar.",
          statusesInfoTitle: "Lo que las respuestas deliberadamente no te dicen",
          statusesInfoContent:
            "«Eliminado» y «en un espacio de trabajo que no puedes ver» son una única respuesta y siempre lo serán. Separarlas permitiría a alguien probar identidades una a una para averiguar qué existe en otro espacio de trabajo. Lo demás es distinguible, porque describe tu propio acceso o esta instalación, ninguno de los cuales es un secreto para ti.",

          failuresTitle: "Los cinco estados de fallo, y por qué se leen de forma distinta",
          failuresIntro:
            "Un campo de referencia puede fallar al mostrarse por cinco motivos distintos. Son cinco frases diferentes en pantalla porque son cinco problemas distintos con cinco soluciones distintas, y esta es la tabla más importante de toda la página.",
          thState: "Qué ha ocurrido",
          thOnScreen: "Qué dice y hace el campo",
          thYouDo: "Qué hacer",
          stNoPermission: "No tienes permiso para ver ese tipo de registro",
          scrNoPermission:
            "El campo indica que el valor almacenado es correcto pero que su nombre no se te puede mostrar, y se vuelve de solo lectura: legible, sin selector. Deliberadamente no se deja en blanco, porque dejarlo en blanco invitaría a alguien sin visibilidad sobre el destino a sobrescribir una referencia perfectamente válida.",
          doNoPermission:
            "Nada respecto a los datos. Pide a quien administre los roles acceso de visualización a ese tipo de registro.",
          stGone: "El registro referenciado ya no existe",
          scrGone:
            "El campo indica que el registro no se encuentra, ofrece los dos motivos posibles —eliminado, o en una organización que no puedes ver— y no afirma ninguno de los dos. Sigue siendo editable.",
          doGone: "Elige otro registro, o borra el campo. Volver a elegir es la solución.",
          stMalformed: "La referencia almacenada es incorrecta",
          scrMalformed:
            "El campo indica que lo almacenado no se puede leer en absoluto, sigue siendo editable, y además se marca a sí mismo como no válido, porque a diferencia de un puntero colgante este no es un valor que el producto haya producido nunca legítimamente.",
          doMalformed:
            "Vuelve a elegir el registro. Este caso hay que reemplazarlo en lugar de volver a anclarlo, y merece la pena reportarlo si tú no lo causaste.",
          stTransient: "La búsqueda no ha podido ejecutarse justo ahora",
          scrTransient:
            "El campo indica que no ha podido cargar el registro referenciado en este momento y que la propia referencia está bien, y ofrece un control Try again.",
          doTransient:
            "Inténtalo de nuevo. Y, muy especialmente, no borres el campo: el valor almacenado es bueno, y borrarlo es la única acción que convierte un fallo pasajero en una pérdida real de datos.",
          stTypeUnavailable: "Esta instalación no puede responder por ese tipo de registro",
          scrTypeUnavailable:
            "El campo indica que ese tipo de registro no está disponible en esta instalación, y no ofrece ningún control Try again, porque reintentarlo se rechazará de forma idéntica siempre.",
          doTypeUnavailable:
            "Pregunta a quien administre el despliegue qué tipos de registro puede usar esta instalación. Es una cuestión de instalación, no de permisos.",
          greyDashTitle: "Por qué esto no es un único guion gris",
          greyDashContent:
            "Cualquiera de los cinco casos podría representarse como un campo vacío, y el resultado sería un puntero a un registro eliminado pasando desapercibido durante un año, indistinguible de un campo que nadie rellenó nunca, e indistinguible de que a un compañero simplemente le falte el permiso. Fusionarlos no es una simplificación estética; borra la única información que dice de quién es el problema. Si alguna vez te tienta hacer que estos se lean igual, este es el párrafo que explica por qué no.",
          emptyVsFailedTitle: "Un campo vacío es una sexta cosa completamente distinta",
          emptyVsFailedContent:
            "Una referencia que nunca se rellenó se lee como vacía, y ese es un hecho distinto de los cinco anteriores. Por eso una referencia rellenada cuyo destino ha desaparecido nunca se muestra como vacía: una persona que mira una celda en blanco debe poder distinguir «nadie respondió a esto» de «la respuesta apunta a algo que ya no está ahí».",

          saveTitle: "Qué se comprueba al guardar una referencia",
          saveIntro:
            "Cada guardado de una referencia ejecuta las mismas comprobaciones en el mismo orden, y cada una falla con su propio mensaje en lugar de un genérico «referencia no válida». Conocer el orden explica cualquier rechazo con el que te puedas encontrar.",
          save1:
            "Las dos partes presentes. Un envío al que le falte el tipo de registro o la identidad se rechaza como referencia incompleta, nunca se trata como un campo vacío, porque media referencia significa que alguien empezó a responder y se detuvo.",
          save2:
            "El tipo de registro está registrado. Un identificador no registrado no tiene ningún permiso detrás, así que no habría nada contra lo que comprobar los controles posteriores. Se rechaza, indicando el identificador.",
          save3:
            "El tipo de registro está permitido para este tipo de valor. Siempre cierto para Entity Reference; para User Reference es la lista fija de permitidos de la plataforma, y el rechazo indica qué está permitido y no solo que tu elección no lo estaba.",
          save4:
            "El tipo de registro coincide con el anclaje de la definición, si lo hay. Se rechaza indicando tanto lo que se esperaba como lo que llegó. Una definición sin anclar se salta esta comprobación por completo; sin anclar significa «cualquier tipo permitido», y nunca debe leerse como «nada configurado, por tanto nada válido».",
          save5:
            "La identidad se puede leer. Una identidad desactualizada o alterada se rechaza con limpieza como identidad no válida, en ese único campo, en lugar de hacer fallar el guardado entero con un error sin explicar.",
          save6:
            "Podrías leer ese registro justo ahora. Esta es la comprobación que hace seguro lo demás, y es deliberadamente un único rechazo plano sin detalles; ver más abajo.",
          saveGate:
            "Esa última comprobación te exige el permiso de visualización propio del tipo de registro destino y resuelve el registro a través del repositorio del módulo propietario, filtrado por espacio de trabajo. Sin ella la funcionalidad sería una herramienta de extracción y no una referencia: alguien que puede editar un registro de administrador pero no puede leer personal podría almacenar una identidad de personal arbitraria y luego leer el nombre de vuelta a través de la búsqueda de resolución. Almacenar un puntero a un dato es una lectura de ese dato, diferida.",
          saveGateInfoTitle: "Por qué ese rechazo dice tan poco",
          saveGateInfoContent:
            "Este es el único lugar de la funcionalidad entera en el que aportas una identidad arbitraria, así que es el único lugar que podría convertirse en una forma de averiguar qué existe en otro espacio de trabajo. Por eso reduce cualquier motivo a un único rechazo. El lado de la lectura puede permitirse ser específico por la razón contraria: para entonces, la identidad es una que este control ya aprobó.",
          saveWhatStored:
            "Un detalle con una consecuencia real: la respuesta almacena el tipo de registro al que el valor apunta realmente, nunca el anclaje de la definición. Los dos coinciden en el momento de guardar precisamente por la cuarta comprobación, pero escribir el anclaje en su lugar reescribiría en silencio el significado de cada respuesta almacenada el día en que alguien vuelva a anclar el campo, que es la propiedad que mantiene legible una respuesta antigua.",

          deleteTitle: "Cuando se elimina el registro referenciado",
          deleteIntro:
            "Eliminar un registro al que apuntan otros registros es una operación normal y no necesita ninguna limpieza. Los punteros se borran solos.",
          d1Title: "El registro se elimina, de la forma habitual",
          d1Content:
            "Alguien elimina al miembro del personal, la cuenta de usuario o la persona a través de la propia pantalla de ese módulo, con el propio permiso de eliminación de ese módulo. Todavía no interviene nada relacionado con los campos personalizados.",
          d2Title: "La eliminación deja constancia de que ha ocurrido",
          d2Content:
            "La eliminación y la nota que indica que ha ocurrido se confirman juntas, en una sola transacción. O suceden las dos o no sucede ninguna, así que no hay ninguna ventana en la que un registro haya desaparecido pero nada haya dejado constancia del hecho.",
          d3Title: "Cada puntero a ese registro se borra",
          d3Content:
            "Las dos partes de cada respuesta afectada se borran juntas, en el mismo paso. Nunca una sin la otra: media referencia es el único estado que nada puede mostrar y ningún operador puede reparar.",
          d4Title: "La fila de valor sobrevive",
          d4Content:
            "No se elimina nada. Cada respuesta conserva su fila, su versión, su lugar dentro del conjunto de respuestas del registro y su historial de auditoría. Solo desaparece el puntero, por lo que el campo se lee después como genuinamente vacío y no como roto.",
          deleteScope:
            "El borrado cubre los dos lugares donde se almacenan respuestas, incluido el almacén más antiguo que todavía guarda respuestas previas a la migración, y cubre también las filas de respuesta eliminadas: una fila eliminada que siga conservando un puntero desactualizado se lo devolvería a cualquiera que más tarde la restaurase.",
          deleteIdempotent:
            "Borrar un puntero que ya está borrado no hace nada, deliberadamente, así que la operación es segura de repetir. Las instantáneas propias de respuestas anteriores del registro no se limpian, y no hace falta que lo hagan: son artefactos de reversión de retención corta que se eliminan según su propio calendario y nunca son una vía de visualización activa mientras tanto.",
          deleteInfoTitle: "Antes de que el puntero se borre, y dónde nunca lo hace",
          deleteInfoContent:
            "Hay una breve ventana entre una eliminación y el borrado de los punteros, y hay tipos de registro cuyo módulo no anuncia en absoluto sus eliminaciones. En ambos casos una referencia simplemente informa con honestidad de que su registro no se encuentra, que es exactamente la segunda fila de la tabla de fallos de más arriba. Nada muestra un nombre equivocado, y nada muestra un campo vacío fingiendo que nadie respondió.",
          deleteSoftTitle: "Un registro simplemente oculto cuenta como desaparecido",
          deleteSoftContent:
            "La mayoría de las eliminaciones del producto ocultan el registro en lugar de eliminarlo físicamente. Un registro oculto ya es inalcanzable a través de las propias pantallas del módulo propietario, así que una referencia lo trata correctamente como desaparecido: un registro que un administrador no puede ver no es un registro al que una referencia pueda resolver.",

          pickerTitle: "Cómo se comporta el selector",
          pickerIntro:
            "Detalles del propio control que resulta más fácil leer una vez que deducir a partir de su comportamiento.",
          thBehaviour: "Comportamiento",
          thWhy: "Por qué es así",
          pkLazy: "No se obtiene nada hasta que abres el control.",
          pkLazyWhy:
            "Un formulario de registro puede llevar varios campos de referencia. Uno que nadie toca no debería consultar en absoluto a otro módulo, y las respuestas se guardan en caché después, así que volver a abrir el control no cuesta nada.",
          pkTwoControls:
            "Un campo sin anclar muestra dos controles, y ninguno le roba el foco al otro.",
          pkTwoControlsWhy:
            "Elegir un tipo de registro te deja en ese control, con el control del registro ya disponible un paso más allá. Abrir automáticamente el selector de registro le quitaría el foco a alguien que todavía está leyendo lo que acaba de elegir.",
          pkAccumulate: "Las páginas siguientes se añaden a la lista en lugar de reemplazarla.",
          pkAccumulateWhy:
            "Una búsqueda sobre toda la tabla de personal de un espacio de trabajo necesita paginación, y una lista que se reemplazara a sí misma perdería la fila junto a la que pasaste de camino a Load more.",
          pkDormant: "Un registro inactivo se marca, no se oculta.",
          pkDormantWhy:
            "Sigue existiendo y sigue siendo una respuesta válida; un miembro del personal que ya no está pero se conserva por asignaciones históricas es exactamente ese caso. Tratarlo como no válido haría que las referencias históricas no se pudieran guardar.",
          pkNoResults: "Un filtro sin resultados y una lista vacía se leen de forma distinta.",
          pkNoResultsWhy:
            "«Tu filtro no encontró nada» trata sobre lo que escribiste. «No hay nada a lo que puedas apuntar» trata sobre tu acceso. Una sola frase para ambos le diría a alguien que escribió mal que no tiene permisos.",
          pkNoRetry: "Dos de los estados de fallo no ofrecen ningún control Try again.",
          pkNoRetryWhy:
            "Un rechazo por permisos y un módulo no disponible se rechazan de forma idéntica siempre. Un botón que invitara a insistir sería peor que ningún botón. Solo un fallo de transporte genuino recibe un reintento, porque es el único que un reintento soluciona.",
          pkViewMode:
            "En modo de solo consulta el control está deshabilitado y no simplemente inactivo al clic.",
          pkViewModeWhy:
            "Un selector de referencia es un selector, así que sigue la misma convención que sigue cualquier otro selector de estos formularios. Su propio estado de solo lectura, usado cuando no puedes ver el nombre del destino, es otra cosa distinta y se ve diferente.",
          pkNoLabelTrick: "El control se nombra a sí mismo para las tecnologías de asistencia.",
          pkNoLabelTrickWhy:
            "Su etiqueta visible es un cableado real y con el que se puede hacer clic, pero el nombre accesible se fija directamente en el control; una etiqueta por sí sola no puede nombrar un control con esta forma. Por eso dos campos de referencia en un mismo formulario se anuncian de forma distinta en lugar de anunciarse ambos como «Record type».",

          diagnoseTitle: "Diagnosticar una referencia que no se muestra",
          diagnoseIntro:
            "En orden. Cada paso descarta uno de los cinco estados anteriores, y los cuatro primeros no necesitan ningún acceso que no tengas ya.",
          dg1Title: "Lee la frase en el campo",
          dg1Content:
            "Los cinco estados nunca comparten redacción, así que el campo ya te ha dicho en cuál estás. Este paso se indica primero porque es el que más a menudo se salta.",
          dg2Title: "Si ofrece Try again, úsalo",
          dg2Content:
            "Solo el fallo pasajero ofrece uno. Si el campo se resuelve al segundo intento, nunca hubo nada mal con el valor almacenado y no hay nada que arreglar.",
          dg3Title: "Comprueba el mismo campo en otro registro",
          dg3Content:
            "Si toda referencia de ese tipo falla de forma idéntica, es cosa de tus permisos o de la instalación, no de los datos. Si solo falla esta, lo que hay que mirar es el registro al que apunta.",
          dg4Title: "Pide a alguien con acceso completo que abra el mismo registro",
          dg4Content:
            "Si esa persona ve un nombre y tú no, es un permiso sobre ese tipo de registro. Si ve el mismo fallo, es cosa de los datos o de la instalación.",
          dg5Title: "Solo entonces decide si volver a elegir o borrar",
          dg5Content:
            "Vuelve a elegir cuando el registro realmente ha desaparecido o el valor almacenado es incorrecto. Borra solo cuando el campo deba quedar vacío. Nunca borres un campo que informó de un fallo pasajero: esa es la única acción que convierte una interrupción ajena en una pérdida de datos propia.",

          limitsTitle: "Límites y carencias deliberadas",
          limitsIntro:
            "Indicados para que nadie se pase una tarde buscando un ajuste que no existe.",
          thLimit: "Límite",
          thDetail: "Detalle",
          limPageSize: "Registros por página en el selector",
          limPageSizeDetail:
            "Veinte por defecto. Una solicitud de más de cien se limita en lugar de rechazarse, y el límite se aplica dos veces al entrar.",
          limDebounce: "Retraso entre escribir y buscar",
          limDebounceDetail:
            "Una pausa breve y fija, la misma que usa cualquier selector del producto respaldado por el servidor. No configurable.",
          limNoName: "Sin nombre para mostrar almacenado",
          limNoNameDetail:
            "No hay ningún ajuste en ningún sitio para guardar una instantánea de un nombre junto a un puntero, y no lo habrá: le entregaría un nombre protegido por un permiso a cualquiera que tenga otro.",
          limNoBacklinks: "Sin vista de «qué apunta a este registro»",
          limNoBacklinksDetail:
            "Nada lista las referencias que apuntan a un registro dado. Eliminar un registro no avisa de cuántos punteros está a punto de borrar.",
          limNoExport: "No aparece en la exportación de definiciones",
          limNoExportDetail:
            "La hoja de cálculo de definiciones de dieciocho columnas no tiene ninguna columna para un tipo de destino anclado, así que una definición exportada no registra a qué apunta su campo.",
          limNoMulti: "Un puntero por campo",
          limNoMultiDetail:
            "No existe un tipo de referencia multivalor. Dos respuestas significan dos campos.",
          limNoTypeFilter: "El selector no se puede acotar con nada más que texto",
          limNoTypeFilterDetail:
            "Qué columnas coinciden con el filtro de texto libre es decisión del módulo propietario, y no hay filtros adicionales: ni «solo activos», ni filtro por grupo.",
          limNoAdminTarget:
            "User Reference sigue rechazando a un administrador, aunque Entity Reference ya no lo hace",
          limNoAdminTargetDetail:
            "Ni desde el formulario de definición ni desde una solicitud que lo evite. El destino permitido de User Reference es exactamente una cosa, identity.user, por diseño original: el propio registro de un administrador es un tipo de fila distinto, y apuntar un campo User Reference a uno se rechaza sin importar por qué módulo haya llegado la solicitud. Entity Reference ofrece administradores como destino desde que una versión posterior le añadió un proveedor de búsqueda para ellos; este límite es solo de User Reference.",

          nextTitle: "Dónde seguir",
          nextIntro:
            "Los conceptos detrás de estas búsquedas están en la página Campos de Referencia.",
          thPage: "Página",
          thCovers: "Qué cubre",
          pageReferences: "Campos de Referencia",
          coversReferences:
            "Qué son los dos tipos de referencia, cuál usar, qué se almacena, por qué no se conserva ningún nombre, cómo anclar un tipo de destino, qué se puede referenciar, y las reglas de espacio de trabajo.",
          pageSecurity: "Seguridad a Nivel de Campo",
          coversSecurity:
            "El mecanismo independiente para ocultar un campo entero a un rol o grupo de usuarios, que es algo distinto de no tener permiso para leer el destino de una referencia.",
          pageLimits: "Límites y Comportamientos",
          coversLimits:
            "Cada límite fijo y cada limitación deliberada de toda la funcionalidad, referencias incluidas.",
        },

        // ═══════════════════════════════════════════════════
        //  Defining a Field
        // ═══════════════════════════════════════════════════
        defining: {
          title: "Definir un Campo",
          description:
            "El formulario de definición control por control, el recorrido completo, las reglas para las claves, cómo crear un campo desde dentro de un registro, cada rechazo, y qué se puede seguir cambiando después de guardar.",
          intro:
            "Las definiciones de campo viven en la pantalla Custom Fields, dentro del espacio de trabajo de Administration. Esta página recorre el formulario entero: cada control, qué lo revela, qué hace, y qué ocurre cuando se rechaza un guardado. Los nombres de los controles se dan tal como aparecen en la interfaz en inglés.",
          beforeTitle: "Dos decisiones que tomar antes de abrir el formulario",
          beforeContent:
            "El tipo de registro y el tipo de valor son ambos permanentes una vez guardados, y también lo es la clave. Lo demás se puede editar después. Si no estás seguro de qué tipo de valor encaja, lee antes la página Tipos de Valor: volver a crear un campo significa perder la totalidad de las respuestas ya almacenadas contra él.",

          whereTitle: "Dónde está la pantalla",
          whereIntro:
            "Los campos personalizados se administran desde cuatro pantallas relacionadas.",
          where1:
            "La propia pantalla Custom Fields, en el espacio de trabajo de Administration, es donde se crean, editan, desactivan y eliminan las definiciones, y donde se asigna un validador.",
          where2:
            "La pantalla Field Groups, a la que se llega desde un enlace en el encabezado de esa página, agrupa los campos de un tipo de registro bajo encabezados.",
          where3:
            "Las pantallas Value Types y Entity Types, a las que también se llega desde ese encabezado, son referencias de solo lectura. Por diseño no tienen entrada propia en el menú lateral.",
          where4:
            "El enlace Add custom field al final de la sección Custom Fields de un formulario de registro abre el mismo formulario de definición en un panel lateral, sin salir del registro.",

          controlsTitle: "El formulario, control por control",
          controlsIntro:
            "Hay controles que no están siempre visibles. Varios aparecen solo cuando se elige un tipo de valor o un alcance concreto, razón por la que el formulario, en un día cualquiera, parece más corto que esta tabla.",
          thControl: "Control",
          thDoes: "Qué hace",
          thWhenShown: "Cuándo aparece",
          ctlEntityTypeDoes:
            "Elige el tipo de registro al que pertenece el campo. Los tipos de registro sin pantalla propia en esta aplicación se listan después de los demás y se marcan como API only: un campo en uno de esos tipos se puede alcanzar a través de la API pero no tiene dónde representarse.",
          ctlEntityTypeWhen:
            "Al crear. Fijo y no editable cuando el formulario se abre desde dentro de un registro, y permanente una vez guardado.",
          ctlKeyDoes:
            "Fija el nombre técnico usado en los mensajes de error, en las exportaciones y en la API. En minúsculas, debe empezar por una letra, y solo puede contener letras, dígitos y guiones bajos.",
          ctlKeyWhen: "Solo al crear. Permanente una vez guardado.",
          ctlLabelEnDoes:
            "La etiqueta en inglés mostrada encima del campo en cada formulario. Obligatoria.",
          ctlLabelArDoes:
            "La etiqueta en árabe. Opcional: un lector árabe ve la etiqueta en inglés cuando esta está en blanco.",
          ctlAlways: "Siempre.",
          ctlValueTypeDoes:
            "Elige uno de los veintidós tipos, decidiendo el control, la validación y el almacenamiento. Elegirlo es lo que revela el cuadro Options, el desplegable Validator o el desplegable Target Entity Type.",
          ctlValueTypeWhen: "Solo al crear. Permanente una vez guardado.",
          ctlPlaceholderEnDoes:
            "Sugerencia opcional, en gris, mostrada dentro del campo vacío, en inglés; por ejemplo, «e.g. Enter your shirt size».",
          ctlPlaceholderArDoes: "La misma sugerencia en árabe.",
          ctlPlaceholderWhen:
            "Solo para los tipos de valor cuyo control admite algún texto de sugerencia. Boolean, Rating, Color, Date y los demás tipos basados en selector no tienen ninguno.",
          ctlOptionsDoes:
            "Contiene la lista de respuestas permitidas, una fila por opción, con una etiqueta en inglés y otra en árabe para cada una. Ver la página Opciones.",
          ctlOptionsWhen: "Solo cuando el tipo de valor es Select o MultiSelect.",
          ctlValidatorDoes:
            "Asigna una de las 13 comprobaciones de formato integradas. Por defecto no hay validador. Ver la página Validadores.",
          ctlValidatorWhen:
            "Solo cuando el tipo de valor es Text. Nunca se muestra para los otros veintiún tipos.",
          ctlValidatorParamDoes:
            "Aporta el parámetro que necesita una comprobación parametrizada: un desplegable de país para Postal Code, texto libre para las otras cinco.",
          ctlValidatorParamWhen: "Solo una vez elegido uno de los seis validadores parametrizados.",
          ctlReferenceTargetDoes:
            "Ancla el campo a un tipo de registro, de modo que cada valor debe apuntar a un registro de ese tipo. Su primera opción, Not pinned — any allowed type, es una elección real y permanente y no un simple relleno: déjala así y cada valor indicará en su lugar su propio tipo de registro. Es la única forma de quitar un anclaje, así que sigue disponible incluso cuando la lista de tipos está vacía o falla al cargar, y el control nunca se deshabilita.",
          ctlReferenceTargetWhen:
            "Solo cuando el tipo de valor es Entity Reference. Un campo User Reference nunca lo muestra, porque su único destino legal lo fija la plataforma y no hay nada que elegir. A diferencia de los tres ajustes permanentes, este se puede cambiar más adelante; lee la advertencia del formulario de edición antes de hacerlo.",
          ctlFieldGroupDoes:
            "Coloca el campo bajo uno de los grupos de campos del tipo de registro, o bajo ningún grupo. Cambiar el tipo de registro borra la elección.",
          ctlFieldGroupWhen:
            "Solo cuando tienes el permiso de visualización de grupos de campos y —en la pantalla completa— una vez elegido un tipo de registro; el panel abierto desde dentro de un registro lo muestra en cuanto tienes el permiso, porque ya conoce el tipo de registro. Se muestra en ambos casos incluso cuando el tipo de registro elegido todavía no tiene grupos, ofreciendo solo la entrada de ningún grupo hasta que exista alguno.",
          ctlRequiredDoes:
            "Rechaza un guardado que deje el campo en blanco. Un valor hecho solo de espacios cuenta como en blanco para cualquier tipo de valor.",
          ctlSortOrderDoes:
            "Sitúa el campo respecto a los demás campos personalizados del formulario. Los números más bajos van primero.",
          ctlSensitivityDoes:
            "Etiqueta cómo debe tratarse el contenido del campo: Unclassified, Internal, Confidential o Restricted. Por defecto es Unclassified. Es una etiqueta para la elaboración de informes y el tratamiento en las exportaciones; no controla quién puede ver el campo.",
          ctlExportableDoes:
            "Marca si los valores de este campo deben incluirse en las exportaciones. Activado por defecto. Es una cuestión de orden y no un permiso —cualquiera que ya pueda leer el campo puede seguir leyendo sus valores en otro sitio— y no elimina el campo de la exportación de definiciones, que lo lista en cualquier caso.",
          ctlActiveDoes:
            "Si el campo se sigue ofreciendo en los formularios. Desactivarlo retira el campo sin tocar las respuestas ya almacenadas contra él.",
          ctlActiveWhen: "Al editar. Un campo recién creado está activo.",
          ctlGlobalDoes:
            "Crea el campo para cada espacio de trabajo de la plataforma en lugar de para uno solo. Los campos globales se saltan la cuota por espacio de trabajo, y después solo un administrador de la plataforma puede editarlos o eliminarlos.",
          ctlGlobalWhen:
            "Solo para un Super Admin de la plataforma que trabaje sin ningún espacio de trabajo seleccionado. Solo al crear: el alcance de un campo es permanente.",

          stepsTitle: "Paso a paso",
          stepsIntro:
            "El flujo completo, para el caso habitual de un campo con alcance de espacio de trabajo.",
          s1Title: "Abre la pantalla Custom Fields y elige Add",
          s1Content:
            "La pantalla lista cada campo que tu espacio de trabajo puede ver, incluidos los campos globales heredados de la plataforma. Las filas globales llevan una insignia y no ofrecen controles de edición ni eliminación.",
          s2Title: "Elige el tipo de registro",
          s2Content:
            "Elige el tipo de registro al que pertenece el campo. Si tu tipo de registro está marcado como API only, detente y reconsidéralo: el campo se guardará, pero nada en la interfaz lo mostrará.",
          s3Title: "Elige el tipo de valor",
          s3Content:
            "Elige entre los veintidós. Esta es la decisión que no se puede deshacer después, y también es lo que hace que aparezcan más abajo en el formulario el cuadro Options, el desplegable Validator o el desplegable Target Entity Type.",
          s4Title: "Ponle nombre al campo",
          s4Content:
            "Introduce la etiqueta en inglés, una etiqueta en árabe si tienes una, y la clave. La clave es permanente, así que elige algo que sigas reconociendo en un mensaje de error dentro de un año.",
          s5Title: "Rellena los ajustes propios del tipo",
          s5Content:
            "Para Select y MultiSelect, añade las opciones. Para Text, elige un validador si quieres uno y aporta su parámetro. Para Entity Reference, decide si anclar un Target Entity Type. Añade textos de sugerencia si el control los admite.",
          s6Title: "Ajusta el comportamiento y la posición",
          s6Content:
            "Activa o desactiva Required, ajusta el Sort Order, y elige un Field Group si los usas. Un grupo solo se ofrece si pertenece al tipo de registro que elegiste.",
          s7Title: "Ajusta la clasificación",
          s7Content:
            "Sensitivity es por defecto Unclassified e Include in exports está activado por defecto. Deja ambos como están salvo que tengas un motivo; el valor por defecto de la exportación existe en particular para que ningún campo falte en silencio de una hoja de cálculo.",
          s8Title: "Guarda, y lee el mensaje si se rechaza",
          s8Content:
            "Un rechazo siempre es específico sobre qué está mal. La tabla más abajo de esta página lista cada rechazo con el que te puedes encontrar y qué significa.",

          keyTitle: "Elegir una clave",
          keyIntro:
            "La clave es el nombre técnico del campo. Aparece en cada mensaje de error, en la exportación a hoja de cálculo, y en la API. Debe estar en minúsculas, empezar por una letra, y contener solo letras, dígitos y guiones bajos, y debe ser única para ese tipo de registro dentro de tu espacio de trabajo.",
          thKeyExample: "Clave",
          thOutcome: "Qué ocurre",
          keyOk: "Aceptada. Esta es la forma a la que hay que aspirar.",
          keyOkDigits:
            "Aceptada. Los dígitos y los guiones bajos están bien después del primer carácter.",
          keyUpper: "Rechazada. Las claves van en minúsculas.",
          keyLeadingDigit: "Rechazada. Una clave debe empezar por una letra.",
          keyHyphen: "Rechazada. Los guiones no forman parte de la gramática; usa un guion bajo.",
          keySpace: "Rechazada. No se permiten espacios.",
          keyWarnTitle: "La clave es permanente",
          keyWarnContent:
            "Una vez guardado el campo, nadie puede cambiar la clave, porque las respuestas ya almacenadas se localizan por ella. Si una clave está mal, el campo tiene que eliminarse y volver a crearse, y eliminarlo destruye las respuestas ya registradas contra él. Este es, con diferencia, el arrepentimiento más frecuente al definir un campo con prisas.",

          inlineTitle: "Añadir un campo desde dentro de un registro",
          inlineIntro:
            "No tienes que dejar lo que estás haciendo para añadir un campo. Cada formulario compatible con campos personalizados termina su sección Custom Fields con un enlace Add custom field, protegido por el permiso de creación.",
          i1Title: "Haz clic en Add custom field",
          i1Content:
            "El formulario de definición se abre en un panel lateral y no en un cuadro de diálogo sobre otro cuadro de diálogo. El formulario del registro que hay detrás sigue visible y legible, y no se pierde nada de lo que ya hubieras escrito en él.",
          i2Title: "Observa que el tipo de registro está fijo",
          i2Content:
            "El tipo de registro se muestra como contexto y no como un desplegable: es el que corresponda a la pantalla en la que ya estás. Cualquier otro control se comporta exactamente igual que en la pantalla completa, selector de validador incluido, con una novedad que tiene este panel y que la pantalla completa no — ver el punto siguiente.",
          i2bTitle: "Adjuntar opcionalmente un Option Set compartido",
          i2bContent:
            "Para Select o MultiSelect, este panel —y solo este panel, no el propio formulario de la pantalla completa— ofrece un selector de Option Set junto al editor manual de Options. Elegir uno lo vincula al campo en el mismo momento en que se crea, en el mismo paso: las opciones manuales ya escritas arriba se conservan, combinadas con las del conjunto en lugar de sustituidas por él. Solo se muestra cuando tienes tanto el permiso de visualización de conjuntos de opciones como el de vinculación.",
          i3Title: "Rellena y guarda",
          i3Content:
            "El panel se cierra y el campo nuevo aparece de inmediato en el formulario del registro, que sigue abierto, vacío y listo para rellenar.",
          i4Title: "Continúa con el registro",
          i4Content:
            "Rellena el nuevo campo junto con lo demás y guarda el registro una sola vez. La definición y la respuesta son dos guardados distintos, en ese orden.",
          inlineInfoTitle: "Si el enlace no está",
          inlineInfoContent:
            "El enlace Add custom field solo aparece para quien tiene el permiso de creación. Sin él, la sección Custom Fields sigue funcionando con normalidad para rellenar los campos ya existentes; solo falta el atajo para definir uno nuevo. Y en un tipo de registro sin ningún campo personalizado definido todavía, la sección Custom Fields no aparece en absoluto.",

          rejectTitle: "Qué se rechaza, y por qué",
          rejectIntro:
            "Cada rechazo al definir un campo lleva un mensaje concreto. Estos son los que realmente puedes encontrarte desde el formulario o desde una solicitud que lo evite.",
          thSituation: "Situación",
          thWhatYouSee: "Qué ves",
          rejDuplicateKey: "Una clave que ya existe para ese tipo de registro",
          rejDuplicateKeyMsg:
            "Rechazada por ya existir. Las claves son únicas por tipo de registro dentro de un espacio de trabajo; la misma clave en otro tipo de registro es válida.",
          rejUnknownEntityType: "Un tipo de registro que no está registrado",
          rejUnknownEntityTypeMsg:
            "Rechazada, indicando la clave: no es un tipo de entidad registrado. Solo se alcanza saltándose el desplegable.",
          rejNoOptions: "Un campo Select o MultiSelect sin opciones",
          rejNoOptionsMsg: "Rechazada: las opciones son obligatorias para los campos Select.",
          rejOptionsOnOther: "Opciones aportadas para un tipo que no las admite",
          rejOptionsOnOtherMsg: "Rechazada: las opciones solo se permiten para campos Select.",
          rejValidatorNonText: "Un validador asignado a un campo que no es Text",
          rejValidatorNonTextMsg:
            "Rechazada, indicando el tipo: un validador solo se puede asignar a un campo Text. El desplegable ni siquiera se muestra para esos tipos, así que esto es el servidor rechazando lo mismo por segunda vez.",
          rejValidatorNoParam: "Un validador parametrizado con su parámetro en blanco",
          rejValidatorNoParamMsg: "Rechazada, indicando el validador: necesita un parámetro.",
          rejValidatorExtraParam: "Un parámetro aportado para un validador que no admite ninguno",
          rejValidatorExtraParamMsg:
            "Rechazada, indicando el validador: no admite ningún parámetro.",
          rejRequiredRestricted:
            "Marcar un campo como obligatorio mientras un rol o grupo lo restringe",
          rejRequiredRestrictedMsg:
            "Rechazada, indicando el campo: no se puede hacer obligatorio mientras está restringido. Elimina antes la restricción, o deja el campo opcional.",
          rejGroupWrongType: "Un grupo de campos que pertenece a otro tipo de registro",
          rejGroupWrongTypeMsg:
            "Rechazada: el grupo de campos elegido pertenece a un tipo de entidad distinto. Cambiar el tipo de registro en el formulario borra la elección de grupo exactamente por este motivo.",
          rejReferenceTargetUnknown: "Anclar a un destino que no es un tipo de registro registrado",
          rejReferenceTargetUnknownMsg:
            "Rechazada, indicando el identificador: no es un tipo de entidad registrado. Solo se alcanza saltándose el desplegable, que no ofrece nada sin registrar.",
          rejReferenceTargetNotAllowed:
            "Anclar un campo User Reference a cualquier cosa que no sea una cuenta de usuario",
          rejReferenceTargetNotAllowedMsg:
            "Rechazada, indicando el tipo de valor y listando qué sí permite. El desplegable no se muestra en absoluto para ese tipo, así que esto es el servidor rechazando lo que el formulario ya se negó a ofrecer.",
          rejGlobalNotSuperAdmin: "Crear un campo global sin ser un Super Admin de la plataforma",
          rejGlobalNotSuperAdminMsg:
            "Rechazada: solo un Super Admin de la plataforma puede crear un campo personalizado global.",
          rejQuota: "Superar el límite de campos de tu plan",
          rejQuotaMsg:
            "Rechazada por cuota. La edición Free no permite ningún campo; el resto de planes tienen su propio máximo por espacio de trabajo. Los campos globales de la plataforma no cuentan para él.",

          afterTitle: "Después de guardar: qué se puede seguir cambiando",
          afterIntro:
            "Tres cosas son permanentes; lo demás no. Merece la pena saber cuáles son antes de guardar y no después.",
          editableTitle: "Editable en cualquier momento",
          editable1: "Las dos etiquetas, y los dos textos de sugerencia",
          editable2: "Required, salvo que un rol o grupo de usuarios restrinja el campo",
          editable3: "El Sort Order, y el Field Group",
          editable4: "Sensitivity, e Include in exports",
          editable5: "Active, que retira el campo sin tocar sus respuestas almacenadas",
          editable6:
            "La lista de opciones, aunque renombrar una opción cambia lo que muestran los registros existentes",
          editable7:
            "El validador y su parámetro, aunque esto nunca vuelve a comprobar las respuestas ya guardadas",
          editable8:
            "El Target Entity Type de un campo Entity Reference: las respuestas ya almacenadas siguen funcionando, y el siguiente guardado de una del tipo antiguo se rechaza hasta que se vuelva a elegir",
          permanentTitle: "Permanente una vez guardado",
          permanent1: "El tipo de registro",
          permanent2: "La clave",
          permanent3: "El tipo de valor",
          permanent4: "El alcance: de espacio de trabajo o global",
          afterOutro:
            "No existe ninguna vía de migración para ninguno de los cuatro ajustes permanentes. Equivocarse en uno significa eliminar el campo y empezar de nuevo, lo que destruye las respuestas ya registradas contra él.",

          verifyTitle: "Comprobar que ha funcionado",
          verifyIntro: "Cuatro comprobaciones rápidas que detectan casi cualquier error.",
          verify1:
            "Abre un registro de ese tipo. La sección Custom Fields debería mostrar tu campo nuevo, vacío, con la etiqueta y el texto de sugerencia que fijaste.",
          verify2:
            "Escribe un valor y guarda. Que no haya ningún error significa que el valor se aceptó; vuelve a abrir el registro y confirma que sigue ahí.",
          verify3:
            "Borra el valor y guarda de nuevo. En un campo opcional esto debería funcionar y dejar el campo genuinamente vacío, no mostrando el valor anterior.",
          verify4:
            "Comprueba la lista de registros. Tu campo también debería ser ahí una columna adicional, mostrando la respuesta de cada registro a la vez.",
          verifyWarnTitle: "Si el campo no aparece",
          verifyWarnContent:
            "Comprueba primero el tipo de registro: un campo definido contra un tipo de registro marcado como API only no tiene dónde representarse. Después comprueba Active. Después comprueba si un rol o grupo de usuarios restringe la clave del campo, porque un campo restringido se omite por completo en lugar de mostrarse en blanco, y se ve exactamente igual que un campo que nunca se definió.",
        },

        // ═══════════════════════════════════════════════════
        //  Field Groups
        // ═══════════════════════════════════════════════════
        groups: {
          title: "Grupos de Campos",
          description:
            "Cómo agrupar bajo encabezados, ordenados a mano, los campos personalizados de un tipo de registro: crear un grupo, la clave estable y permanente, el orden, la eliminación, los grupos globales, y qué no afecta un grupo.",
          intro:
            "Un grupo de campos reúne varios campos personalizados de un mismo tipo de registro bajo un encabezado, en un orden que fijas a mano. Sin grupos, los campos personalizados simplemente aparecen por Sort Order bajo un único encabezado Custom Fields; con ellos, puedes separar los datos de contacto de los datos médicos y de las preferencias de equipación en el mismo formulario. Los grupos se gestionan en la pantalla Field Groups, a la que se llega desde un enlace en el encabezado de la página Custom Fields.",
          permInfoTitle: "Los grupos de campos necesitan sus propios permisos",
          permInfoContent:
            "Toda la funcionalidad está controlada por un conjunto de permisos independiente de las definiciones de campo, incluido uno propio para reordenar. Un rol que ya tiene cada uno de los permisos de campos personalizados no obtiene estos automáticamente. Sin ellos no hay ningún enlace Manage field groups ni ningún selector Field Group en el formulario de definición; no hay nada roto, simplemente la funcionalidad no está concedida. Editar un campo que ya tiene un grupo y guardarlo conserva ese grupo en lugar de borrarlo.",

          whatTitle: "De qué se compone un grupo",
          whatIntro:
            "Los grupos pertenecen a exactamente un tipo de registro, así que la pantalla no muestra nada hasta que eliges uno, y el estado vacío lo indica en lugar de parecer roto.",
          thPart: "Ajuste",
          thWhat: "Qué es",
          thChange: "¿Se puede cambiar después?",
          partEntityType: "El tipo de registro cuyos campos puede agrupar este grupo.",
          partStableKey:
            "Un nombre técnico para el grupo, único dentro del tipo de registro. En minúsculas, empieza por una letra, y solo admite letras, dígitos y guiones bajos.",
          partLabelEn: "El encabezado en inglés mostrado encima de los campos del grupo.",
          partLabelAr: "El encabezado en árabe.",
          partSortOrder:
            "Dónde se sitúa el grupo respecto a los demás grupos del tipo de registro.",
          partScope: "Si el grupo pertenece a tu espacio de trabajo o a toda la plataforma.",
          changeNever: "No: permanente una vez guardado",
          changeAnytime: "Sí, en cualquier momento",

          createTitle: "Crear un grupo",
          createIntro: "Cuatro pasos, en la pantalla Field Groups.",
          c1Title: "Elige el tipo de registro",
          c1Content:
            "No se lista nada antes de hacerlo. Un grupo solo es válido para un tipo de registro, así que no hay una vista conjunta de los tipos desde la que partir.",
          c2Title: "Dale una clave estable",
          c2Content:
            "El formulario exige una. Se convierte a minúsculas mientras escribes y rechaza los caracteres que no forman parte de la gramática. Elígela con cuidado: esta es permanente.",
          c3Title: "Dale etiquetas y un orden",
          c3Content:
            "Un encabezado en inglés, un encabezado en árabe, y un número que decide dónde se sitúa el grupo entre los demás grupos del tipo de registro.",
          c4Title: "Guarda, y después asígnale campos",
          c4Content:
            "El grupo aparece en la lista. Abre cualquier definición de campo personalizado del mismo tipo de registro y un selector Field Group lo ofrece ya, junto con una entrada de ningún grupo.",

          stableKeyTitle: "La clave estable",
          stableKeyIntro:
            "La clave estable es el nombre técnico del grupo. Sigue la misma gramática que la clave de un campo —minúsculas, empieza por una letra, letras, dígitos y guiones bajos— y debe ser única entre los grupos de ese tipo de registro.",
          thKeyExample: "Clave estable",
          thOutcome: "Qué ocurre",
          skOk: "Aceptada.",
          skLowercased:
            "Aceptada, y convertida a minúsculas mientras escribes. Verás que se convierte en contact_details.",
          skHyphen:
            "Rechazada mientras escribes. El campo rechaza los caracteres que no forman parte de la gramática.",
          skLeadingDigit: "Rechazada. Una clave estable debe empezar por una letra.",
          skDuplicate:
            "Rechazada, indicando la clave: ya existe un grupo de campos con esa clave para este tipo de registro.",
          exSkDuplicate: "Una clave ya usada por otro grupo del mismo tipo de registro",
          stableKeyWhy:
            "Una vez guardado el grupo, la clave estable es visible pero aparece atenuada y nadie puede cambiarla. Eso es deliberado y no un descuido: el esquema exportado nombra un grupo por esta clave, así que renombrarla convertiría en silencio una futura reimportación de una actualización en una creación, contra un paquete que ya se ha distribuido. Poder ver la clave sigue importando —la necesitas para relacionar un paquete exportado con el grupo al que se refiere—, que es por lo que se muestra en lugar de ocultarse.",
          stableKeyWarnTitle: "No existe forma de renombrarla",
          stableKeyWarnContent:
            "Si una clave estable está mal, el grupo tiene que eliminarse y volver a crearse, y cada campo asignado a él tiene que reasignarse. No esperes que aparezca ningún botón de edición: su ausencia es el diseño.",

          assignTitle: "Asignar un campo a un grupo",
          assignIntro:
            "La asignación ocurre en el campo, no en el grupo. No existe ninguna pantalla para arrastrar campos a un grupo.",
          assign1:
            "Abre una definición de campo personalizado del mismo tipo de registro. Un selector Field Group ofrece cada grupo de ese tipo de registro, más una entrada de ningún grupo.",
          assign2:
            "Elegir ningún grupo es la única forma de desagrupar un campo. No existe ningún otro control independiente para quitarlo en ningún otro sitio.",
          assign3:
            "Cambiar el tipo de registro en un formulario de creación borra cualquier grupo ya elegido, porque un grupo de un tipo de registro nunca es válido para otro.",
          assign4:
            "Un campo puede pertenecer como máximo a un grupo. No hay forma de mostrar un campo bajo dos encabezados.",

          orderTitle: "Ordenar grupos",
          orderIntro:
            "Los grupos se ordenan en la pantalla Field Groups, arrastrando una fila o usando sus botones Move up y Move down. Ambos hacen lo mismo y los dos se conservan.",
          orderKeyboard:
            "Los botones no son una comodidad adicional. Alguien que use solo el teclado no tiene ningún gesto de arrastre, así que los botones son la vía accesible y se espera que funcionen de forma idéntica; si una fila se mueve arrastrando pero no con el botón, eso es un defecto.",
          orderLimitTitle: "Reordenar deja de funcionar más allá de 100 grupos",
          orderLimitContent:
            "Una solicitud de reordenación lleva de una vez el conjunto reordenable entero, y más de 100 grupos para un mismo tipo de registro se rechaza de plano. Más allá de ese punto no se puede mover ningún grupo de ese tipo de registro. La pantalla lo indica en lugar de fallar de forma genérica, pero el tope es real y no es configurable.",
          orderGlobalTitle: "No puedes situar tu grupo respecto a uno global",
          orderGlobalContent:
            "Reordenar funciona en bloque, sin términos medios, y rechaza cualquier grupo que quien llama no posea, así que la reordenación de un espacio de trabajo cubre solo sus propios grupos, que después se renumeran desde cero. Esos números pueden coincidir con el propio orden de un grupo global, y el empate se resuelve por la etiqueta en inglés. El efecto visible es que mover tu grupo al principio puede dejarlo por debajo de un grupo global y parecer que no ha pasado nada.",

          deleteTitle: "Eliminar un grupo",
          deleteIntro:
            "Eliminar un grupo nunca elimina campos. La confirmación lo indica explícitamente, y después los campos siguen existiendo y simplemente quedan sin grupo, apareciendo de nuevo bajo el encabezado Custom Fields por defecto.",
          deleteEditing:
            "Un detalle que conviene conocer: si empiezas a editar un grupo y luego eliminas ese mismo grupo desde su fila mientras el panel de edición sigue abierto, el panel se cierra y no se crea ningún grupo nuevo. Guardar en ese momento no resucita el grupo bajo una nueva identidad.",

          globalTitle: "Grupos globales",
          globalIntro:
            "Un administrador de la plataforma sin ningún espacio de trabajo seleccionado crea un grupo global, y un aviso en la pantalla lo explica. El interruptor de alcance aparece al crear y nunca al editar, porque el alcance de un grupo es permanente igual que el de un campo.",
          globalTenantView:
            "Dentro de un espacio de trabajo, un grupo global muestra una insignia Global y no ofrece ningún control de edición, eliminación o movimiento. Eso no es la interfaz ocultando algo de forma arbitraria: el servidor rechazaría esas operaciones, así que los controles no se ofrecen.",

          effectTitle: "Qué afecta y qué no afecta un grupo",
          doesTitle: "Un grupo sí",
          does1: "Junta campos relacionados bajo un encabezado en el formulario del registro",
          does2: "Te permite ordenar los grupos a mano, arrastrando o con Move up y Move down",
          does3: "Lleva su propio encabezado en inglés y en árabe, traducido igual que lo demás",
          does4:
            "Sobrevive a la eliminación de un campo, y deja que un campo lo abandone mediante la entrada de ningún grupo",
          doesNotTitle: "Un grupo no",
          doesNot1:
            "Controla quién puede ver un campo: eso es la seguridad a nivel de campo, que no tiene relación",
          doesNot2: "Elimina sus campos cuando se elimina el propio grupo",
          doesNot3:
            "Se traslada entre tipos de registro, ni se aplica a más de un tipo de registro a la vez",
          doesNot4: "Cambia cómo se valida, almacena, exporta o muestra un valor",

          errorsTitle: "Errores de grupo que puedes ver",
          thSituation: "Situación",
          thWhatYouSee: "Qué ves",
          errDuplicateKey: "Una clave estable ya usada en ese tipo de registro",
          errDuplicateKeyMsg:
            "Rechazada, indicando la clave: ya existe un grupo de campos con esa clave para este tipo de entidad.",
          errWrongEntityType: "Asignar un campo a un grupo de otro tipo de registro",
          errWrongEntityTypeMsg:
            "Rechazada: el grupo de campos elegido pertenece a un tipo de entidad distinto.",
          errTooManyReorder: "Reordenar más de 100 grupos a la vez",
          errTooManyReorderMsg:
            "Rechazada, indicando el máximo: no se puede reordenar en una sola solicitud más grupos que ese número.",
          errDuplicateReorder: "El mismo grupo listado dos veces en una reordenación",
          errDuplicateReorderMsg:
            "Rechazada: el mismo grupo de campos aparece más de una vez en la lista de reordenación.",
          errMixedReorder: "Grupos de dos tipos de registro en una misma reordenación",
          errMixedReorderMsg:
            "Rechazada: cada grupo de campos de una solicitud de reordenación debe pertenecer al mismo tipo de entidad.",
          errGlobalNotSuperAdmin: "Crear un grupo global sin ser un Super Admin de la plataforma",
          errGlobalNotSuperAdminMsg:
            "Rechazada: solo un Super Admin de la plataforma puede crear un grupo de campos global.",
          errNoDefinition:
            "Asignar un grupo a un campo que todavía no tiene registro de definición",
          errNoDefinitionMsg:
            "Rechazada, explicando que el campo no tiene registro de definición y que primero hay que ejecutar el relleno retroactivo de definiciones. Esto solo ocurre en un entorno actualizado desde una versión anterior.",
        },

        // ═══════════════════════════════════════════════════
        //  Options
        // ═══════════════════════════════════════════════════
        options: {
          title: "Opciones",
          description:
            "Cómo escribir las respuestas permitidas para los campos Select y MultiSelect: el editor bilingüe de opciones, cómo se compara un valor enviado, y qué le hace a los registros ya existentes añadir, renombrar o eliminar una opción.",
          intro:
            "Un campo Select o MultiSelect lleva su propia lista de respuestas permitidas. La lista pertenece al campo —no hay ninguna lista compartida reutilizada entre varios campos— y se escribe en el formulario de definición, en el cuadro Options que aparece en cuanto eliges cualquiera de esos dos tipos de valor. Los dos tipos usan exactamente la misma lista y el mismo editor; la única diferencia es que una respuesta MultiSelect puede contener varias entradas de ella a la vez.",
          storedInfoTitle: "El texto de la opción en inglés es la respuesta almacenada",
          storedInfoContent:
            "No hay ningún código oculto independiente detrás de una opción. La etiqueta en inglés que escribes es literalmente lo que se graba en cada registro que la elige, y es contra lo que el producto compara un valor enviado. La etiqueta en árabe es solo para mostrarse. Este único hecho explica por completo el comportamiento de esta página.",

          editorTitle: "El editor de opciones",
          editorIntro:
            "Las opciones se editan como una lista de filas y no como texto libre. Cada fila es una opción.",
          editor1: "Add option añade una fila al final de la lista.",
          editor2: "Cada fila lleva una etiqueta en inglés y una etiqueta en árabe.",
          editor3: "Remove option elimina una fila.",
          editor4:
            "El orden de las filas es el orden en que se ofrecen las opciones en el formulario del registro, de arriba abajo.",
          editor5:
            "Una lista vacía muestra un aviso para añadir la primera opción: un campo Select sin opciones no se puede guardar.",
          editorBilingual:
            "Las dos etiquetas se almacenan como dos listas paralelas, emparejadas fila por fila. Un lector árabe ve la etiqueta en árabe; la respuesta grabada en el registro es la de inglés en cualquier caso. Dejar en blanco una etiqueta en árabe está permitido, y esa opción entonces muestra su etiqueta en inglés a cualquier persona.",

          exampleTitle: "Un ejemplo completo",
          exampleIntro:
            "Un campo de talla de camiseta en un tipo Select, con tres opciones. La columna de la derecha es lo que realmente termina en un registro.",
          thEnglish: "Etiqueta en inglés",
          thArabic: "Etiqueta en árabe",
          thStored: "Almacenado en el registro",
          exampleOutro:
            "Un usuario que lee en árabe y elige متوسط almacena Medium, exactamente igual que un usuario que lee en inglés y elige Medium. Ambos ven su propio idioma tanto al elegir como al consultarlo después; el dato subyacente es un único valor consistente.",

          matchTitle: "Cómo se compara un valor enviado",
          matchIntro:
            "El valor enviado se recorta y después se compara exactamente con las etiquetas en inglés. La comparación distingue mayúsculas de minúsculas. Usando las tres opciones anteriores:",
          thSubmitted: "Valor enviado",
          thOutcome: "Qué ocurre",
          matchOk: "Aceptado, y almacenado como Medium.",
          matchTrimmed:
            "Aceptado. Los dos lados se recortan antes de la comparación, así que los espacios que lo rodean nunca provocan un rechazo espurio.",
          matchCase:
            "Rechazado: VALIDATION_INVALID_FORMAT. Las mayúsculas y minúsculas importan, lo que también significa que Medium y medium pueden coexistir legítimamente como dos opciones independientes si de verdad lo quieres así.",
          matchArabic:
            "Rechazado si se envía directamente a la API: solo se comparan las etiquetas en inglés. Elegir متوسط en la interfaz funciona con normalidad, porque la interfaz envía por debajo la etiqueta en inglés.",
          matchUnknown:
            "Rechazado: VALIDATION_INVALID_FORMAT, con un mensaje que cita tanto el valor rechazado como la clave del campo.",
          matchBlank:
            "Tratado como vacío: se almacena como borrado en un campo opcional, se rechaza con VALIDATION_REQUIRED en uno obligatorio.",
          exPadded: '" Medium" con un espacio inicial',
          exBlank: "Un valor en blanco",

          multiTitle: "Particularidades de MultiSelect",
          multiIntro:
            "MultiSelect reutiliza esta misma lista y este mismo editor. Lo que cambia es el valor: varias respuestas a la vez, en el orden en que se eligieron, hasta un tope fijo de 19.",
          multiOrder:
            "Aceptado, y devuelto como Blue y luego Red: el orden en que se eligió, no el orden en que se listaron las opciones.",
          multiRemove:
            "Aceptado. Quitar una selección deja las demás en su orden relativo existente.",
          multiTooMany:
            "Rechazado: VALIDATION_MAX_LENGTH, indicando el tope de 19. El selector hace que toda opción no seleccionada deje de poder elegirse en cuanto se llega a 19, y muestra un contador en vivo «N de 19 seleccionadas», así que esto normalmente no se puede alcanzar desde la interfaz.",
          multiDuplicate:
            "Rechazado: VALIDATION_UNIQUE. Una selección repetida se rechaza, no se reduce.",
          multiEmpty:
            "Tratado como vacío, exactamente igual que un valor escalar en blanco para cualquier otro tipo: se borra en un campo opcional, se rechaza en uno obligatorio.",
          exMultiOrder:
            "Blue, y luego Red, en un campo cuya lista de opciones tiene Red antes que Blue",
          exMultiRemove: "Quitar una selección de tres",
          exMultiTwenty: "Una vigésima selección",
          exMultiRepeat: "La misma opción seleccionada dos veces",
          exMultiEmptyList: "Una lista explícitamente vacía",
          multiOrderWarnTitle: "El orden de selección no es el orden de las opciones",
          multiOrderWarnContent:
            "Como una respuesta MultiSelect conserva el orden en que se eligió, una columna de lista que muestre esa respuesta no tiene garantizado leerse en el orden en que redactaste las opciones. Eso es lo que hace que el orden se conserve con fidelidad, pero sorprende a la mayoría de la gente la primera vez que se da cuenta.",

          changingTitle: "Cambiar la lista más adelante",
          changingIntro:
            "La lista de opciones es editable en cualquier momento. Como el texto de la opción es la respuesta almacenada, algunas ediciones alcanzan hacia atrás a los registros ya existentes y otras no.",
          thChange: "Edición",
          thEffect: "Efecto sobre los registros ya existentes",
          chgAdd: "Añadir una opción nueva",
          chgAddEffect:
            "Ninguno. Las respuestas existentes no se tocan; la opción nueva simplemente pasa a estar disponible.",
          chgRename: "Renombrar una etiqueta en inglés",
          chgRenameEffect:
            "Cada registro que ya tenía el texto antiguo muestra ahora el texto nuevo. No se migra nada y no se pierde nada, porque la fila de la opción es a lo que apunta el registro, pero la respuesta que ve la gente ha cambiado bajo sus pies.",
          chgRemove: "Eliminar una opción",
          chgRemoveEffect:
            "Los registros que ya la tenían conservan su respuesta almacenada y la siguen mostrando. La opción deja de ofrecerse a cualquiera nuevo, y la próxima vez que alguien edite uno de esos registros tendrá que elegir una respuesta distinta para poder guardarlo.",
          chgReorder: "Reordenar las filas",
          chgReorderEffect:
            "Cambia el orden en que se ofrecen las opciones. No cambia ninguna respuesta almacenada, y no reordena una respuesta MultiSelect ya existente, que conserva el orden en que se eligió.",
          chgArabicOnly: "Cambiar solo una etiqueta en árabe",
          chgArabicOnlyEffect:
            "Solo afecta a la visualización. La respuesta almacenada es la etiqueta en inglés, así que no cambia nada en los datos.",
          renameWarnTitle: "Renombra con cuidado, y prefiere añadir",
          renameWarnContent:
            "Renombrar una opción es la única edición que reescribe en silencio el aspecto del historial: un registro que respondió «Medium» el año pasado se leerá como aquello en lo que hayas renombrado Medium. Si la distinción te importa, añade una opción nueva y deja de ofrecer la antigua en lugar de renombrarla.",

          errorsTitle: "Errores de opciones que puedes ver",
          thSituation: "Situación",
          thWhatYouSee: "Qué ves",
          errNoOptions: "Guardar un campo Select o MultiSelect con la lista vacía",
          errNoOptionsMsg: "Rechazada: las opciones son obligatorias para los campos Select.",
          errOptionsOnOther: "Opciones aportadas en un tipo que no las admite",
          errOptionsOnOtherMsg: "Rechazada: las opciones solo se permiten para campos Select.",
          errNotAllowed: "Un valor que no es una de las opciones",
          errNotAllowedMsg:
            "Rechazada: VALIDATION_INVALID_FORMAT, citando el valor y la clave del campo.",
          errTooMany: "Más de 19 selecciones en MultiSelect",
          errTooManyMsg: "Rechazada: VALIDATION_MAX_LENGTH, indicando el tope de 19.",
          errDuplicate: "La misma opción de MultiSelect dos veces en un mismo guardado",
          errDuplicateMsg: "Rechazada: VALIDATION_UNIQUE, citando el valor repetido.",

          notYetTitle: "Qué no hace la lista de opciones",
          notYetIntro: "Tres cosas que razonablemente se piden, y cuál es la respuesta hoy.",
          notYet1:
            "La lista integrada propia de este campo no se puede reutilizar en otro campo: las Options de cada campo son suyas, escritas aquí. Sin embargo, una lista de países que necesiten tres campos ya no hay que escribirla tres veces: vincula los tres a un Option Set compartido y versionado en su lugar (ver Conjuntos de Opciones) y edítalo una sola vez.",
          notYet2:
            "No hay ningún color, icono o código por opción que puedas fijar. La etiqueta es toda la opción en lo que respecta al formulario de definición.",
          notYet3:
            "No hay ningún tope sobre cuántas opciones puede tener una lista, pero una respuesta MultiSelect sigue sin poder seleccionar más de 19 de ellas.",
        },

        // ═══════════════════════════════════════════════════
        //  Validators
        // ═══════════════════════════════════════════════════
        validators: {
          title: "Validadores",
          description:
            "Las 13 comprobaciones de formato integradas para campos Text, con ejemplos de entradas aceptadas y rechazadas, las seis que necesitan un parámetro, los siete países de código postal admitidos, y cada rechazo con el que te puedes encontrar.",
          intro:
            "Un validador es una comprobación de formato adicional y opcional que asignas a un campo Text al definirlo, de modo que un valor con la forma incorrecta se rechaza en el momento en que alguien intenta guardarlo, en lugar de convertirse en silencio en un dato incorrecto que aflora meses después. Eliges una de 13 comprobaciones integradas en un desplegable, y siete de ellas no necesitan ningún parámetro adicional.",
          textOnlyTitle: "Los validadores son exclusivos de Text",
          textOnlyContent:
            "Un validador solo se puede asignar a un campo Text. Ni Number, ni Date, ni Select, ni Email, ni Url, ni Phone, ni LongText, ni ningún otro: el desplegable Validator ni siquiera se muestra para ellos, y el servidor vuelve a rechazar lo mismo si una solicitud se salta el formulario. Si necesitas una dirección de correo con restricciones adicionales, la respuesta hoy es un campo Text con un validador y no un campo Email.",

          whyClosedTitle: "Por qué no hay ningún cuadro de patrón",
          whyClosedIntro:
            "Deliberadamente no hay ninguna entrada de texto libre ni de expresión regular en ningún sitio del producto. Un patrón escrito a mano se puede construir para que consuma una cantidad enorme de tiempo de procesamiento con una entrada corta, lo que convierte un formulario de entrada de datos en una forma de tumbar el sistema. Por eso el conjunto de comprobaciones es fijo y seleccionado de antemano, y cada una lleva su propio límite de longitud corto y su propio límite de tiempo.",

          howTitle: "Cómo se ejecuta un validador",
          howIntro:
            "Ocurren cuatro cosas en este orden cada vez que se guarda un valor en el campo.",
          how1: "Si el valor está vacío o hecho solo de espacios, se trata como vacío y no se ejecuta ningún validador en absoluto.",
          how2: "Se ejecuta el límite global de 4.000 caracteres de Text, y rechaza con VALIDATION_MAX_LENGTH si el valor es más largo.",
          how3: "Se ejecuta el límite de longitud propio del validador, mucho más corto —11 caracteres para un código SWIFT, 15 para un IMEI, y así sucesivamente— y también rechaza con VALIDATION_MAX_LENGTH.",
          how4: "Solo entonces se ejecuta la comprobación propia del validador, rechazando con su propio código y mensaje.",
          howTwoPoints:
            "La comprobación se exige en dos momentos distintos, y conviene saber que existen los dos. Al definir el campo, una combinación no válida de validador y parámetro se rechaza al guardar la definición. Al guardar un valor, el validador se ejecuta de nuevo contra cada valor que alguien guarda en el campo.",

          fixedTitle: "Las siete comprobaciones sin parámetro",
          fixedIntro:
            "Estas validan un formato externo concreto y nunca admiten un parámetro; aportar uno se rechaza en sí mismo. Tres de ellas verifican un dígito de control real, lo que significa que un solo dígito mal escrito se detecta y no solo una longitud incorrecta.",
          thValidator: "Validador",
          thShape: "Forma",
          thMaxLength: "Longitud máxima",
          thChecksum: "Dígito de control",
          shapeIban: "Dos letras, dos dígitos, y después de 11 a 30 letras o dígitos",
          shapeImei: "Exactamente 15 dígitos",
          shapeSwift: "Seis letras, dos letras o dígitos, opcionalmente tres más",
          shapePlate:
            "De 2 a 15 letras, dígitos, espacios o guiones, en cualquier combinación de mayúsculas y minúsculas",
          shapeEgypt:
            "14 dígitos: marcador de siglo, después una fecha AAMMDD verosímil, y siete dígitos más",
          shapeSaudi: "10 dígitos que empiezan por 1 o 2",
          shapeEmirati: "784, cuatro dígitos, siete dígitos, un dígito; los guiones son opcionales",
          checksumReal: "Sí, se verifica",
          checksumNone: "Ninguno en el estándar",
          checksumUnpublished: "No se verifica: no hay ninguno publicado",
          thExample: "Entrada de ejemplo",
          thOutcome: "Qué ocurre",

          ibanTitle: "IBAN",
          ibanFor:
            "Para un número de cuenta bancaria internacional. Úsalo siempre que un dígito equivocado pudiera enviar dinero al lugar equivocado.",
          ibanChecks:
            "Primero se comprueba la forma, y después se verifican los dígitos de control reales según ISO. Limitado a 34 caracteres; ningún IBAN real es más largo. El valor se compara exactamente tal como se envía: no se convierte a mayúsculas ni se le quitan los espacios automáticamente.",
          ibanOk: "Aceptado. La forma y los dígitos de control son correctos.",
          ibanBadCheck:
            "Rechazado: VALIDATION_INVALID_FORMAT. La forma es perfectamente válida y solo el dígito de control está mal, que es precisamente la clase de error que una comprobación que solo mirase la forma pasaría por alto.",
          ibanLower: "Rechazado. Las letras deben ir en mayúsculas.",
          ibanSpaces:
            "Rechazado. Los IBAN a menudo se imprimen en grupos de cuatro para facilitar la lectura, pero la forma almacenada no lleva espacios.",

          imeiTitle: "IMEI",
          imeiFor:
            "Para el número de identidad de un dispositivo móvil, tal como aparece impreso en el dispositivo o en su caja.",
          imeiChecks:
            "Exactamente 15 dígitos, y después se verifica el dígito de control real. Limitado a 15 caracteres. Las variantes de 16 y 17 caracteres que muestran algunos dispositivos no se aceptan.",
          imeiOk: "Aceptado.",
          imeiBadCheck:
            "Rechazado: VALIDATION_INVALID_FORMAT. Quince dígitos, forma correcta, último dígito equivocado.",
          imeiShort:
            "Rechazado: VALIDATION_INVALID_FORMAT. Catorce dígitos no supera la comprobación de forma; el límite de longitud solo detecta un valor más largo de 15.",

          swiftBicTitle: "SWIFT / BIC Code",
          swiftBicFor:
            "Para un código identificador de banco, usado junto con un número de cuenta en una transferencia internacional.",
          swiftBicChecks:
            "Ocho u once caracteres: seis letras, después dos letras o dígitos, y opcionalmente tres letras o dígitos más. Solo mayúsculas, sin separadores, limitado a 11 caracteres. El estándar no tiene dígito de control, así que un código con buena forma que no pertenece a ningún banco real se acepta.",
          swiftOk8: "Aceptado: la forma de ocho caracteres.",
          swiftOk11: "Aceptado: la forma de once caracteres con código de sucursal.",
          swiftDigit:
            "Rechazado: VALIDATION_INVALID_FORMAT. Los primeros seis caracteres deben ser letras, sin excepción.",
          swiftLower:
            "Rechazado. Este es un formato externo fijo, y las minúsculas no forman parte de él.",
          swiftLength: "Rechazado. Ocho u once caracteres exactos; nueve no es ninguno de los dos.",

          plateTitle: "Vehicle Plate Number",
          plateFor:
            "Para una matrícula de vehículo, cuando quieres detectar disparates obvios sin comprometerte con el formato de un país concreto.",
          plateChecks:
            "De 2 a 15 caracteres, formados por letras, dígitos, espacios y guiones en cualquier combinación. No distingue mayúsculas de minúsculas. Deliberadamente permisivo: no hay ningún formato de matrícula específico de país en esta comprobación, porque los formatos de matrícula varían por país y por tipo de vehículo dentro de un mismo país.",
          plateOk: "Aceptado.",
          plateLowerOk:
            "Aceptado. A diferencia de SWIFT, esta comprobación no distingue mayúsculas de minúsculas.",
          plateTooShort: "Rechazado: VALIDATION_INVALID_FORMAT. El mínimo son dos caracteres.",
          plateBadChar:
            "Rechazado. Una barra no es una de las cuatro clases de caracteres permitidas.",

          egyptIdTitle: "Egyptian National ID",
          egyptIdFor: "Para un número de identidad nacional egipcio.",
          egyptIdChecks:
            "Catorce dígitos: un marcador de siglo de 2 o 3, después una fecha de nacimiento en formato AAMMDD que debe ser verosímil según el calendario, y siete dígitos más. Solo estructura: Egipto nunca ha publicado un algoritmo de dígito de control, así que el último dígito no se verifica. Publicar un algoritmo adivinado rechazaría identidades reales y válidas, que es peor que no comprobarlo.",
          egyptOk: "Aceptado.",
          egyptBadMonth: "Rechazado: VALIDATION_INVALID_FORMAT. El mes 13 no es un mes verosímil.",
          egyptBadDay: "Rechazado. El día 32 no es un día verosímil.",
          egyptBadCentury: "Rechazado. El marcador de siglo debe ser 2 o 3.",
          egyptLength: "Rechazado. Trece dígitos no son catorce.",

          saudiIdTitle: "Saudi National ID",
          saudiIdFor:
            "Para un número de identidad nacional saudí o un número de Iqama (residencia).",
          saudiIdChecks:
            "Diez dígitos, el primero 1 para un ciudadano o 2 para un residente, y se verifica el dígito de control real. Limitado a 10 caracteres.",
          saudiOk: "Aceptado. La forma y el dígito de control son correctos.",
          saudiBadCheck:
            "Rechazado: VALIDATION_INVALID_FORMAT. Forma correcta, dígito de control equivocado.",
          saudiBadPrefix: "Rechazado. El primer dígito debe ser 1 o 2.",
          saudiLength: "Rechazado. Nueve dígitos no son diez.",

          emiratiIdTitle: "Emirati ID (UAE)",
          emiratiIdFor: "Para un número de identidad de los Emiratos.",
          emiratiIdChecks:
            "La forma 784-AAAA-XXXXXXX-C, con los guiones opcionales. Limitado a 18 caracteres. Solo estructura: los Emiratos nunca han publicado un algoritmo de dígito de control, así que el último dígito no se verifica, por el mismo motivo que la comprobación egipcia.",
          emiratiOk: "Aceptado, guiones incluidos.",
          emiratiNoHyphens:
            "Aceptado. Los guiones son opcionales, así que las dos formas de escribirlo funcionan.",
          emiratiBadPrefix:
            "Rechazado: VALIDATION_INVALID_FORMAT. Cualquier número de identidad de los Emiratos empieza por 784.",
          emiratiLength: "Rechazado. El bloque central tiene siete dígitos, no seis.",

          paramTitle: "Las seis comprobaciones que necesitan un parámetro",
          paramIntro:
            "Estas exigen un Validator Parameter, y dejarlo en blanco se rechaza al definir el campo, igual que aportar uno para un validador que no admite ninguno. El control Validator Parameter aparece en cuanto eliges una de estas seis.",
          thParamFormat: "Formato del parámetro",
          thParamExample: "Ejemplo de parámetro",
          paramFmtPostal: "Un país, elegido de un desplegable con los siete admitidos",
          paramFmtNumeric:
            "Dos límites separados por coma; cualquiera de los dos lados puede quedar en blanco para un extremo abierto",
          paramFmtLength:
            "Dos cantidades de caracteres separadas por coma; cualquiera de los dos lados puede quedar en blanco",
          paramFmtOneOf: "Un valor permitido por línea",
          paramFmtContains: "Cualquier texto literal",
          paramFmtStartsWith: "Cualquier texto literal",
          paramExOneOf: "Goalkeeper / Defender / Midfielder / Forward, uno por línea",

          postalTitle: "Postal Code",
          postalFor:
            "Para un código postal de un país concreto. El país forma parte de la definición, no algo que elija quien rellena el registro.",
          postalChecks:
            "El valor se compara con el formato real de código postal del país que configuraste. Limitado a 16 caracteres. Se admiten siete países y el desplegable nunca ofrece ningún otro.",
          postalEgOk: "Aceptado. Egipto son cinco dígitos.",
          postalEgBad: "Rechazado: VALIDATION_INVALID_FORMAT. Cuatro dígitos no son cinco.",
          postalUsOk: "Aceptado. Tanto la forma de cinco dígitos como la ZIP+4 son válidas.",
          postalGbOk:
            "Aceptado. El formato del Reino Unido se compara en cualquier combinación de mayúsculas y minúsculas, con o sin su espacio.",
          postalCaOk:
            "Aceptado, incluidas las exclusiones de letras reales que aplica Canada Post.",
          exPostalEg: "11511, con el parámetro EG",
          exPostalEgBad: "1151, con el parámetro EG",
          exPostalUsPlus4: "90210-1234, con el parámetro US",
          exPostalGb: "SW1A 1AA, con el parámetro GB",
          exPostalCa: "K1A 0B1, con el parámetro CA",

          numericRangeTitle: "Numeric Range",
          numericRangeFor:
            "Para un número dentro de unos límites que tú fijas, en un campo que es Text y no Number: un número de camiseta, el tamaño de una plantilla, un recuento de dorsales.",
          numericRangeChecks:
            "El valor debe interpretarse como un número y caer dentro del rango. El parámetro son dos límites separados por coma; dejar un lado en blanco deja ese extremo abierto, pero dejar los dos en blanco se rechaza, porque un rango sin ninguna restricción equivale a no asignar ningún validador.",
          numericOk: "Aceptado.",
          numericOut: "Rechazado: VALIDATION_RANGE.",
          numericNotANumber:
            "Rechazado: VALIDATION_RANGE. Un valor que no es un número no puede estar dentro de un rango.",
          numericOpenOk:
            "Aceptado. Un límite superior abierto significa cualquier número igual o mayor que el inferior.",
          numericBothBlank:
            "Rechazado al definir el campo, explicando que el validador necesita al menos un límite.",
          exNumeric50: "50, con el parámetro 1,100",
          exNumeric150: "150, con el parámetro 1,100",
          exNumericText: '"fifty", con el parámetro 1,100',
          exNumericOpen: "5000, con el parámetro 1,",
          exNumericBothBlank: "El parámetro , con los dos lados en blanco",

          lengthRangeTitle: "Length Range",
          lengthRangeFor:
            "Para un texto que debe tener una longitud determinada: un código de dos letras, una referencia de al menos ocho caracteres.",
          lengthRangeChecks:
            "El número de caracteres debe caer dentro del rango. El parámetro son dos cantidades de caracteres separadas por coma, y cualquiera de los dos lados se puede dejar en blanco para un extremo abierto. Esta comprobación produce dos códigos distintos en lugar de uno, para distinguir demasiado corto de demasiado largo.",
          lengthOk: "Aceptado.",
          lengthTooShort: "Rechazado: VALIDATION_MIN_LENGTH, indicando el mínimo.",
          lengthTooLong: "Rechazado: VALIDATION_MAX_LENGTH, indicando el máximo.",
          exLength10: '"Alexandria" — 10 caracteres, con el parámetro 2,50',
          exLength1: '"A" — 1 carácter, con el parámetro 2,50',
          exLength80: "Un valor de 80 caracteres, con el parámetro 2,50",

          oneOfListTitle: "One of a List",
          oneOfListFor:
            "Para un conjunto cerrado de respuestas en un campo Text. Si el conjunto cerrado es la razón de ser del campo, normalmente un campo Select es la mejor opción, pero este validador existe para cuando quieres el comportamiento de un validador sobre un campo Text.",
          oneOfListChecks:
            "El valor debe coincidir exactamente con una línea de la lista que configuraste, un valor por línea. La comparación distingue mayúsculas de minúsculas.",
          oneOfOk: "Aceptado.",
          oneOfCase:
            "Rechazado: VALIDATION_INVALID_FORMAT. La coincidencia distingue mayúsculas de minúsculas.",
          oneOfUnknown: "Rechazado: VALIDATION_INVALID_FORMAT. El valor no está en la lista.",

          containsTitle: "Contains Text",
          containsFor:
            "Para un valor que debe incluir en algún punto una marca: un prefijo de club, una etiqueta de temporada, un código de departamento.",
          containsChecks:
            "El valor debe contener el texto literal que configuraste, comparado distinguiendo mayúsculas de minúsculas.",
          containsOk: "Aceptado, con el parámetro FC-.",
          containsCase:
            "Rechazado: VALIDATION_INVALID_FORMAT. La coincidencia respeta las mayúsculas y minúsculas.",
          containsMissing: "Rechazado: VALIDATION_INVALID_FORMAT. La marca no está presente.",

          startsWithTitle: "Starts With Text",
          startsWithFor:
            "Para un valor que debe empezar con un prefijo: un código de país, un código de sucursal, una raíz de referencia fija.",
          startsWithChecks:
            "El valor debe empezar con el texto literal que configuraste, comparado distinguiendo mayúsculas de minúsculas.",
          startsOk: "Aceptado, con el parámetro EG-.",
          startsWrongPlace:
            "Rechazado: VALIDATION_INVALID_FORMAT. El texto está presente pero no al principio; usa Contains Text si la posición no importa.",
          startsCase:
            "Rechazado: VALIDATION_INVALID_FORMAT. La coincidencia respeta las mayúsculas y minúsculas.",

          postalCountriesTitle: "Los siete países de Postal Code",
          postalCountriesIntro:
            "Postal Code incluye formatos reales y verificados para exactamente siete países, y el parámetro es un desplegable y no texto libre, así que no se puede elegir ningún otro país desde el formulario.",
          thCountry: "País",
          thFormat: "Formato",
          thValidExample: "Ejemplo válido",
          fmtEg: "Exactamente cinco dígitos",
          fmtSa: "Cinco dígitos, opcionalmente un guion y una extensión de cuatro dígitos",
          fmtUs:
            "Un ZIP de cinco dígitos, opcionalmente un guion y una extensión de cuatro dígitos",
          fmtGb:
            "La forma estándar del código postal del Reino Unido, en cualquier combinación de mayúsculas y minúsculas, espacio opcional",
          fmtDe: "Exactamente cinco dígitos, se permite un cero inicial",
          fmtFr: "Exactamente cinco dígitos",
          fmtCa: "La forma A1A 1A1, con las exclusiones de letras reales que aplica Canada Post",
          uaeTitle: "Los Emiratos Árabes Unidos están ausentes a propósito",
          uaeContent:
            "Los Emiratos no tienen un sistema nacional de códigos postales, así que no hay ningún formato real contra el que comprobar un valor, ni estricto ni laxo. No es una entrada que falte y esté pendiente de añadirse: intentar usarlo se rechaza al definir el campo con su propio mensaje explicativo, distinto del mensaje genérico de país no admitido que obtendrías por una errata, e indicando que en su lugar dejes el campo sin validador. El desplegable nunca lo ofrece.",

          attachTitle: "Rechazos al asignar un validador",
          attachIntro:
            "Cada uno de estos rechazos ocurre al definir el campo, antes de que se guarde ningún valor. Varios solo se alcanzan con una solicitud que se salte el formulario, porque el formulario directamente no ofrece la combinación no válida.",
          thSituation: "Situación",
          thWhatYouSee: "Qué ves",
          attNonText: "Un validador en un campo que no es Text",
          attNonTextMsg:
            "Rechazada, indicando el tipo de valor: un validador solo se puede asignar a un campo Text.",
          attNoParam: "Un validador parametrizado con el parámetro en blanco",
          attNoParamMsg: "Rechazada, indicando el validador: necesita un parámetro.",
          attExtraParam: "Un parámetro en uno de los siete que no admiten ninguno",
          attExtraParamMsg: "Rechazada, indicando el validador: no admite ningún parámetro.",
          attBadRange: "Un parámetro de rango con formato incorrecto",
          attBadRangeMsg:
            "Rechazada, explicando que se necesitan dos límites separados por coma, que cualquiera de los dos lados puede quedar en blanco, y que el límite inferior no debe superar al superior.",
          attNoBound: "Un parámetro de rango con los dos lados en blanco",
          attNoBoundMsg:
            "Rechazada, explicando que un parámetro con los dos lados en blanco aceptaría cualquier valor, lo que equivale a no asignar ningún validador.",
          attUnsupportedCountry: "Un país de Postal Code que no es uno de los siete",
          attUnsupportedCountryMsg:
            "Rechazada, indicando el país y listando los siete admitidos: EG, SA, US, GB, DE, FR, CA.",
          attUae: "Postal Code con AE",
          attUaeMsg:
            "Rechazada con su propio mensaje dedicado, explicando que los Emiratos no tienen un sistema nacional de códigos postales y que en su lugar el campo debería dejarse sin validador.",

          codesTitle: "Códigos de error de los validadores",
          codesIntro:
            "Cualquier rechazo de un validador es un HTTP 422, nunca un 500. Si alguna vez ves que un fallo de validador produce un 500, es un defecto que merece reportarse: cada uno está escrito para rechazar con limpieza.",
          thCode: "Código",
          thWhenItFires: "Cuándo se produce",
          codeInvalidFormat:
            "La mayoría de los fallos de validador: una forma que no coincide, un dígito de control que no se verifica, un valor que no está en una lista de One of a List, una marca de Contains o Starts With que falta, o un código postal que no coincide con su país.",
          codeRange:
            "Numeric Range: el valor está fuera de los límites, o directamente no es un número.",
          codeMaxLength:
            "El límite global de 4.000 caracteres de Text, el límite propio, más corto, de un validador, o el límite superior de Length Range.",
          codeMinLength: "El límite inferior de Length Range.",
          codeRequired:
            "El campo es Required y el valor está vacío. Esto se produce antes de que se ejecute cualquier validador, así que un valor hecho solo de espacios en un campo obligatorio recibe el mensaje genérico de obligatorio y no uno específico del validador.",
          codesInfoTitle: "Los mensajes nombran la clave, no la etiqueta",
          codesInfoContent:
            "Un mensaje de validador cita la clave técnica del campo —«'shirt_size' is not a valid IBAN.»— y no su etiqueta visible. Relaciónalo por la clave cuando estés rastreando un fallo.",

          limitsTitle: "Qué no hacen los validadores",
          limit1:
            "Solo se asignan a un campo Text. No hay forma de poner una comprobación de formato en ninguno de los otros veintiún tipos.",
          limit2:
            "Nunca vuelven a comprobar valores ya guardados. Asignar un validador a un campo que ya tiene respuestas deja esas respuestas exactamente como están, incluidas las que ahora fallarían, hasta que alguien las vuelva a introducir y guardar.",
          limit3:
            "Nunca se ejecutan sobre un valor vacío. En un campo que no es Required, un valor hecho solo de espacios se almacena como borrado sin ningún error de validador en absoluto; marca el campo como Required si una respuesta en blanco debe rechazarse.",
          limit4:
            "No se pueden buscar ni filtrar. No hay ninguna vista conjunta de los campos que usan IBAN; la única forma de ver qué validador tiene un campo es abrir ese campo.",
          limit5:
            "No tienen ninguna referencia navegable dentro del producto. Para ver la lista de validadores abres el formulario de definición de un campo Text y lees el desplegable.",
          limit6:
            "No se pueden escribir a mano. No hay ninguna entrada de expresión regular o de patrón en ningún sitio, por diseño, y las 13 comprobaciones integradas son el conjunto completo.",
        },

        // ═══════════════════════════════════════════════════
        //  Field-Level Security
        // ═══════════════════════════════════════════════════
        security: {
          title: "Seguridad a Nivel de Campo",
          description:
            "Cómo ocultar un campo personalizado concreto a las personas que tienen un rol o grupo de usuarios: cómo se configura, qué ven, por qué sus guardados no destruyen los valores ocultos, y por qué obligatorio y restringido no se pueden combinar.",
          intro:
            "La seguridad a nivel de campo te permite ocultar un campo determinado a las personas que tienen un rol o un grupo de usuarios concretos. Se aplica a los campos personalizados exactamente igual que a los campos propios de una pantalla: un campo que un administrador ha restringido deliberadamente tampoco se puede leer a través de la API de campos personalizados. Este es el mecanismo al que recurrir cuando un valor de verdad no debe verse.",
          notSensitivityTitle: "Esto no es el ajuste Sensitivity",
          notSensitivityContent:
            "El ajuste Sensitivity de la definición de un campo —Unclassified, Internal, Confidential, Restricted— es una etiqueta para la elaboración de informes y el tratamiento en las exportaciones. No restringe el acceso a nada, y los dos mecanismos no tienen ninguna relación. Si quieres que un campo quede oculto, configúralo aquí, en el rol o el grupo de usuarios, no en la definición del campo.",

          whereTitle: "Dónde se configuran las restricciones",
          whereIntro:
            "Las restricciones se fijan en lo que concede el acceso, no en el campo. Hay dos sitios, y se suman entre sí.",
          where1:
            "Por rol: la lista de campos restringidos de un permiso, en el cuadro de permisos de ese rol.",
          where2: "Por grupo de usuarios: las restricciones propias del grupo.",
          whereKeyed:
            "Los nombres de campo se escriben a mano, y se identifican por el recurso de permiso que ya protege el registro —employees, party-people—, no por el tipo de registro. Merece la pena leer los detalles de abajo una vez antes de configurar nada.",
          thAspect: "Aspecto",
          thBehaviour: "Comportamiento",
          aspSources: "Dos fuentes",
          behSources:
            "Una restricción de rol y una restricción de grupo se combinan por unión. Un grupo nunca puede ampliar lo que un rol ha restringido, y no hay ninguna anulación en ninguna de las dos direcciones.",
          aspCase: "Mayúsculas y minúsculas",
          behCase:
            "La comparación ignora las mayúsculas y minúsculas, así que Salary, salary y SALARY son el mismo campo.",
          aspResource: "Identificación",
          behResource:
            "Las restricciones se identifican por el recurso de permiso, el mismo recurso que ya protege el propio registro, no por el tipo de entidad ni por el grupo de campos.",
          aspBuiltIn: "Alcance del mecanismo",
          behBuiltIn:
            "El mismo mecanismo cubre tanto los campos propios de una pantalla como sus campos personalizados. Una única lista de campos restringidos, un único comportamiento.",
          aspExempt: "Excepción",
          behExempt:
            "El administrador de sistema de la plataforma siempre está exento y siempre ve cada campo. Es la misma excepción que ya hace el mecanismo de los campos propios.",

          seesTitle: "Qué ve una persona restringida",
          seesIntro:
            "Nada en absoluto. El campo no aparece atenuado, ni en blanco, ni marcado como oculto: la entrada se omite por completo tanto del formulario del registro como de la lista de registros.",
          seesIndistinguishable:
            "Un campo omitido es indistinguible de un campo que nunca se definió. Eso es deliberado: mostrar un texto de sugerencia le diría a alguien que hay un valor que no tiene permiso para ver, lo que ya es información en sí misma. También significa que un compañero que reporte que falta un campo puede estar describiendo una restricción y no un fallo; comprueba las restricciones de rol y de grupo antes de ponerte a buscar un defecto.",

          savingTitle: "Guardar alrededor de un campo oculto",
          savingIntro:
            "Esta es la parte que conviene entender bien, porque la implementación obvia destruiría datos. Cuando alguien guarda un registro, el guardado reemplaza de una vez el conjunto entero de valores de campos personalizados, así que un campo ausente de la solicitud normalmente significaría «bórralo».",
          savingWhy:
            "Un campo restringido está ausente por un motivo completamente distinto: nunca se le envió a esa persona. El producto distingue los dos casos, y deja el valor almacenado de un campo restringido exactamente como estaba. Alguien que no puede ver un valor ya no puede borrarlo editando el registro a su alrededor.",
          savingInfoTitle: "La consecuencia práctica",
          savingInfoContent:
            "Puedes dar con seguridad a alguien acceso de edición a un registro mientras restringes en él un campo sensible. Sus ediciones normales se aplican, y el valor que no puede ver sobrevive intacto.",

          writingTitle: "Escribir un campo restringido a propósito",
          writingIntro:
            "Un intento de escribir explícitamente un campo restringido se rechaza de plano, y tampoco se aplica nada más de ese mismo guardado. Rechazar toda la solicitud en lugar de descartar en silencio ese único campo es deliberado: un guardado que se informa como correcto pero al que en silencio le falta un campo es el fallo más difícil de notar.",
          writingProbe:
            "El rechazo también se produce cuando el valor enviado resulta ser igual al almacenado, así que nadie puede averiguar un valor oculto probando qué envíos se aceptan.",
          thAttempt: "Intento",
          thResult: "Resultado",
          attSaveOthers: "Guardar el registro, cambiando solo campos que puedes ver",
          resSaveOthers:
            "Funciona. El valor almacenado del campo restringido se deja exactamente como estaba, no se borra.",
          attWriteRestricted: "Enviar un valor para el campo restringido",
          resWriteRestricted:
            "Rechazado con un mensaje que indica el campo, y el registro no se guarda en absoluto, ni siquiera los campos que sí tenías permiso de cambiar.",
          attWriteSameValue: "Enviar el valor actual del campo restringido",
          resWriteSameValue:
            "Rechazado de la misma forma. El resultado no depende de si acertaste, así que no se puede usar para sondear el valor.",
          attReadApi: "Leer directamente los valores de campos personalizados del registro",
          resReadApi:
            "El campo restringido está ausente de la respuesta. Este era el hueco que la seguridad a nivel de campo dejaba abierto específicamente para los campos personalizados, y ya está cerrado.",

          requiredTitle: "Obligatorio y restringido no se pueden combinar",
          requiredIntro:
            "Un campo obligatorio nunca puede rellenarlo alguien a quien no se le permite verlo: no podría guardar el registro en absoluto. Por eso el producto rechaza la combinación, en cualquier orden en que lo intentes.",
          thSituation: "Intento",
          thWhatYouSee: "Qué ves",
          reqRestrictRequired: "Restringir un campo que actualmente es obligatorio",
          reqRestrictRequiredMsg: "Rechazado, indicando el campo.",
          reqRequireRestricted:
            "Marcar un campo como obligatorio mientras un rol o grupo lo restringe",
          reqRequireRestrictedMsg:
            "Rechazado, indicando el campo y diciéndote que elimines antes la restricción o dejes el campo opcional.",
          requiredInfoTitle: "El orden no ayuda",
          requiredInfoContent:
            "Hacer las dos operaciones en el otro orden no permite saltarse la regla. Se comprueban las dos direcciones, así que no hay ninguna secuencia que deje un campo a la vez obligatorio y restringido.",

          reachTitle: "Dónde más llega una restricción",
          reachIntro:
            "Una restricción no es solo cosa del formulario. Se aplica de forma consistente en cualquier sitio donde los valores del campo podrían aflorar.",
          reach1: "El formulario del registro: el campo se omite.",
          reach2: "La lista de registros: la columna se omite.",
          reach3:
            "La API de valores de campos personalizados: el campo está ausente de la respuesta, y se rechaza al escribir.",
          reach4:
            "La exportación a hoja de cálculo de las definiciones: las columnas restringidas están ausentes del archivo en lugar de presentes y en blanco.",

          exampleTitle: "Un ejemplo completo",
          exampleIntro:
            "Restringir un campo de salario en un registro de personal, y confirmar que se comporta correctamente.",
          e1Title: "Define el campo y dale un valor",
          e1Content:
            "Como administrador con visibilidad completa, define un campo personalizado con la clave salary en el tipo de registro de personal, y fija un valor en un registro.",
          e2Title: "Restríngelo en un rol",
          e2Content:
            "Añade salary a la lista de campos restringidos del permiso correspondiente en un rol, y después inicia sesión como alguien que solo tenga ese rol.",
          e3Title: "Confirma que está ausente, no en blanco",
          e3Content:
            "Abre el mismo registro de personal. El campo Salary no debería aparecer en absoluto en el formulario, y no debería haber ninguna columna Salary en la lista de personal. Si lo ves vacío en lugar de ausente, la restricción no está aplicándose.",
          e4Title: "Guarda el registro y comprueba que el valor sobrevivió",
          e4Content:
            "Como ese usuario restringido, cambia otra cosa del registro y guarda. Después, como el administrador sin restricción, vuelve a abrir el registro y confirma que el salario sigue ahí. Este es el caso que destruiría datos en una implementación ingenua.",
          e5Title: "Confirma las dos reglas que protegen la configuración",
          e5Content:
            "Intenta marcar salary como obligatorio mientras la restricción está activa: rechazado. Elimina la restricción, márcalo como obligatorio, e intenta restringirlo de nuevo: también rechazado. Por último, pon la misma clave en las restricciones de un grupo de usuarios en lugar de en las de un rol y confirma que se comporta de forma idéntica.",
          proofTitle: "Una advertencia honesta sobre la verificación",
          proofContent:
            "Cada comportamiento de autorización descrito en esta página lo aplican guardas reales, con pruebas unitarias, pero actualmente no existe ninguna prueba automatizada de extremo a extremo que lo demuestre a través de toda la pila HTTP. Eso hace que la verificación manual sea aquí realmente informativa y no redundante: si estás preparando un espacio de trabajo en el que un campo de verdad no debe verse, compruébalo a mano una vez.",
        },

        // ═══════════════════════════════════════════════════
        //  Managing Fields
        // ═══════════════════════════════════════════════════
        managing: {
          title: "Gestión de Campos",
          description:
            "Editar y retirar definiciones, el cuadro de historial de cambios, el informe de uso e impacto, eliminar sin destruir datos, la exportación de 18 columnas, y las dos pantallas de referencia de solo lectura.",
          intro:
            "Una vez que los campos existen, la pantalla Custom Fields es donde se cuidan: se editan, se retiran, se auditan, se miden y se exportan. Esta página cubre cada una de esas acciones, y las dos pantallas de referencia de solo lectura que responden a «qué tipos existen» y «a qué tipos de registro puedo asociarlo».",

          rowMenuTitle: "El menú de fila",
          rowMenuIntro:
            "Cada campo de la lista tiene un menú de fila con ocho acciones. Cada una necesita su propio permiso, así que un rol puede ver unas y no otras.",
          thAction: "Acción",
          thDoes: "Qué hace",
          thNeeds: "Permiso",
          actEdit:
            "Abre el formulario de definición, completado con el detalle completo del campo.",
          actOptionSets:
            "Asigna, configura o desvincula un Option Set compartido y versionado para campos Select o MultiSelect.",
          actVisibilityRules:
            "Abre el cuadro de reglas de visibilidad condicional para configurar reglas de mostrar u ocultar evaluadas contra campos hermanos.",
          actConvertType:
            "Abre un cuadro de diálogo para convertir el tipo de valor del campo: elige un destino entre los tipos a los que puede convertirse de forma segura, confirma si la conversión implica pérdida de datos, y revierte el cambio después si hace falta.",
          actVersions:
            "Abre el panel de historial de versiones: consulta la cadena de versiones, genera un nuevo borrador, o publica o descarta uno ya generado.",
          actHistory:
            "Lista cada cambio registrado en la definición del campo, del más reciente al más antiguo, con quién lo hizo y cuándo.",
          actUsage:
            "Informa de cuántas respuestas tiene el campo, desglosadas por tipo de registro, y si eliminarlo destruiría datos.",
          actDelete:
            "Elimina la definición; se rechaza primero si tiene respuestas, hasta que lo confirmes explícitamente.",

          editTitle: "Editar una definición",
          editIntro:
            "Editar abre el mismo formulario que crear, con los ajustes permanentes mostrados pero no editables: tipo de registro, clave, tipo de valor y alcance. Lo demás se puede cambiar, y los cambios surten efecto en el siguiente formulario que abra alguien.",
          editLoadFailure:
            "Si el detalle que hay detrás del botón Edit no se carga, el formulario deliberadamente no se abre, y en su lugar recibes un mensaje. Eso es una salvaguarda y no un inconveniente: la fila de la lista no lleva las opciones, los textos de sugerencia ni el validador, así que abrir un formulario completado a partir de ella y guardar borraría los tres en silencio.",
          editWarnTitle: "Dos ediciones alcanzan hacia atrás",
          editWarnContent:
            "Renombrar una opción cambia lo que muestra cada registro existente, porque el texto de la opción es la respuesta almacenada. Asignar o cambiar un validador no vuelve a comprobar las respuestas ya guardadas, así que un campo puede contener valores que su propio validador actual rechazaría. Ambos casos se cubren en detalle en las páginas Opciones y Validadores.",

          // Visibility Rules
          visibilityRulesTitle: "Administración de reglas de visibilidad",
          visibilityRulesIntro:
            "Las reglas de visibilidad permiten mostrar u ocultar campos de forma dinámica en los formularios de registro según los valores de campos personalizados hermanos del mismo tipo de registro. Cuando una regla está activa, tanto los formularios del lado cliente como la validación del lado servidor evalúan las condiciones de forma determinista.",
          thOperator: "Operador",
          thOperatorMeaning: "Condición evaluada",
          thOperatorExample: "Ejemplo de disparo",
          opEquals: "Equals",
          opEqualsMeaning:
            "El valor del campo controlador coincide exactamente con el valor de destino.",
          opEqualsExample: "Mostrar Kit Size cuando Staff Role sea igual a Coach.",
          opNotEquals: "Does not equal",
          opNotEqualsMeaning:
            "El campo controlador tiene cualquier valor distinto del valor de destino.",
          opNotEqualsExample: "Mostrar Dietary Requirements cuando Meal Plan no sea igual a None.",
          opIsEmpty: "Is empty",
          opIsEmptyMeaning:
            "El campo controlador no tiene ninguna respuesta almacenada, o es nulo.",
          opIsEmptyExample: "Mostrar Explanation cuando ID Number esté vacío.",
          opIsNotEmpty: "Is not empty",
          opIsNotEmptyMeaning: "El campo controlador tiene cualquier valor no nulo y no vacío.",
          opIsNotEmptyExample: "Mostrar Expiry Date cuando Passport Number no esté vacío.",
          opIn: "In set",
          opInMeaning:
            "La respuesta del campo controlador es uno de varios valores separados por coma.",
          opInExample:
            "Mostrar Specialization cuando Department esté en Medical, Coaching, Analytics.",
          opNotIn: "Not in set",
          opNotInMeaning:
            "La respuesta del campo controlador no es ninguno de los valores listados.",
          opNotInExample: "Mostrar General Notes cuando Category no esté en VIP, Board.",
          opGreaterThan: "Greater than",
          opGreaterThanMeaning: "La respuesta numérica o de fecha supera estrictamente el umbral.",
          opGreaterThanExample: "Mostrar Clearance Details cuando Security Level sea mayor que 3.",
          opLessThan: "Less than",
          opLessThanMeaning:
            "La respuesta numérica o de fecha está estrictamente por debajo del umbral.",
          opLessThanExample: "Mostrar Parental Consent cuando Age sea menor que 18.",
          visibilityRulesEvaluation:
            "Un campo con varias reglas solo es visible cuando se cumplen todas ellas: un simple Y entre todas, no una competición entre las acciones Show y Hide, porque cada regla solo expresa una condición bajo la que ser visible. Priority ordena las reglas únicamente a efectos de diagnóstico y visualización; nunca cambia qué reglas se aplican. Un campo que una regla está ocultando en ese momento también se omite de la validación Required, así que una condición que nadie puede ver nunca bloquea un guardado.",
          visibilityRulesTipTitle: "Solo se condiciona a campos hermanos",
          visibilityRulesTipContent:
            "Una regla solo puede referenciar campos hermanos definidos exactamente en el mismo tipo de entidad. No se permiten condiciones entre entidades distintas (por ejemplo, comprobar un ajuste del espacio de trabajo desde un campo de persona), para preservar la integridad transaccional de un único registro.",

          // Conversion
          conversionTitle: "Conversión de tipo de valor y reversión",
          conversionIntro:
            "Convertir el tipo de valor declarado de un campo es una operación aparte, a la que se llega desde su propia acción del menú de fila y no desde el formulario de edición: cambia cómo se representan las respuestas ya almacenadas, no solo el aspecto que tendrán las futuras. Solo se permiten nueve pares de tipos concretos; cualquier otro par se rechaza de plano, incluido cualquier par que implique un tipo de referencia, File, Image o RichText.",
          thConversionClass: "Nivel de seguridad",
          thConversionPairs: "Pares de tipos admitidos",
          thConversionRisk: "Garantía de conservación de datos",
          classLossless: "Sin pérdidas",
          classLosslessPairs:
            "Text → LongText, Number → Text, Number → LongText, Percent → Text, Rating → Text, Percent → Number, Rating → Number",
          classLosslessRisk:
            "Cada valor existente se interpreta directamente en el tipo de destino sin perder nada: un número con formato de texto, o un porcentaje o una valoración que vuelven a leerse como un número simple.",
          classLossy: "Con pérdidas (requiere confirmación)",
          classLossyPairs: "LongText → Text, Text → Number",
          classLossyRisk:
            "Ninguno de los dos pares trunca. LongText → Text rechaza la operación completa en cuanto un solo valor almacenado supera el propio límite de 4.000 caracteres de Text, indicando su longitud real. Text → Number rechaza la operación completa en cuanto un solo valor almacenado no logra interpretarse como número. En ambos casos, una sola fila mala bloquea todas las filas: no existe una conversión parcial que cambie unos registros y deje otros como estaban.",
          classIncompatible: "No se ofrece",
          classIncompatiblePairs:
            "El resto de los pares posibles —453 de los 462—, incluido cualquier par que implique EntityReference, UserReference, File, Image o RichText.",
          classIncompatibleRisk:
            "Se rechaza antes de ejecutar nada. Un valor con forma de referencia o de contenido multimedia no tiene una forma de texto o de número con sentido a la que convertirse, y la dirección inversa no tiene nada real a lo que apuntar.",
          conversionLossyWarnTitle:
            "Una conversión con pérdidas se aplica a cada valor almacenado, de forma permanente",
          conversionLossyWarnContent:
            "Una ejecución correcta cambia todas las filas a la vez: no hay una confirmación aparte por registro, y nada se trunca ni se borra en silencio más allá de lo que haga la propia conversión del tipo de destino. Ejecuta siempre antes Usage & impact para ver cuántos registros se verán afectados antes de confirmar.",
          conversionDryRunIntro:
            "Antes de cambiar nada, el servidor comprueba cada valor almacenado contra el tipo de destino en una primera pasada que no escribe nada. Si un solo valor fallara al convertirse, la operación completa se rechaza de antemano, indicando cada fila que falla, y no se cambia nada: no hay término medio, nunca una conversión parcial que deje algunas filas con el tipo antiguo y otras con el nuevo.",
          conversionRollbackTitle: "Reversión mediante instantánea",
          conversionRollbackContent:
            "Cada conversión escribe una instantánea del valor anterior para cada fila antes de modificarla. Un Super Admin puede revertir una ejecución de conversión concreta mediante su job-run id, restaurando los valores anteriores exactos. Las instantáneas caducan y se purgan automáticamente pasados siete días, así que la reversión tiene una ventana real de tiempo, en lugar de estar disponible de forma indefinida.",

          // Versions & Drafts
          versionsTitle:
            "Ciclo de vida de las versiones y los borradores de la definición de un campo",
          versionsIntro:
            "Los valores escalares, las opciones y las reglas de visibilidad vigentes de una definición se pueden clonar en un borrador aislado que después se publica —sustituyendo la versión vigente en un solo paso— o se descarta, dejando la versión vigente intacta en cualquiera de los dos casos.",
          thVersionStatus: "Estado",
          thVersionMeaning: "Significado en el ciclo de vida",
          thVersionActions: "Acciones disponibles",
          vStatusDraft: "Draft",
          vMeaningDraft:
            "Un clon aislado de la definición tal como estaba en el momento en que se generó: su propia copia de los valores escalares, las opciones y las reglas de visibilidad. No se sirve en ningún formulario de registro.",
          vActionsDraft:
            "Publish, Discard. Actualmente nada permite modificar un borrador una vez generado: un clon incorrecto debe descartarse y generarse de nuevo.",
          vStatusPublished: "Published",
          vMeaningPublished:
            "La única versión activa que se sirve actualmente en cada formulario de registro para este campo.",
          vActionsPublished: "Create Draft (genera un nuevo clon de trabajo), View History.",
          vStatusDeprecated: "Deprecated",
          vMeaningDeprecated:
            "Una versión Published anterior, sustituida cuando se promovió un borrador. Sus opciones y reglas clonadas siguen asociadas a ella, pero quedan inertes: la aplicación de las reglas solo lee la versión Published vigente.",
          vActionsDeprecated:
            "Registro de auditoría de solo lectura. Se conserva para preservar la integridad histórica.",
          vStatusArchived: "Archived",
          vMeaningArchived:
            "Un borrador descartado que se conserva en lugar de eliminarse, para que su número de versión nunca pueda reutilizarse.",
          vActionsArchived: "Solo referencia histórica.",
          versionsSnapshotWarnTitle: "Un borrador es una instantánea, no un espejo en vivo",
          versionsSnapshotWarnContent:
            "Un borrador no sigue los cambios realizados en la versión activa mientras permanece abierto: solo conserva el aspecto que tenía la versión activa en el momento en que se creó. Publicar no combina ambas cosas: reemplaza por completo la versión activa con la instantánea del borrador, descartando silenciosamente cualquier cambio activo realizado mientras tanto. Publique un borrador cuanto antes, o vuelva a crearlo si la versión activa ha avanzado desde entonces.",
          versionsPromotionIntro:
            "Publicar un borrador pasa la versión Published vigente a estado Deprecated en el mismo guardado. El número de versión siempre aumenta, y cada carga de formulario a partir de ese momento sirve la nueva versión Published.",
          versionsRuleGuardTitle:
            "Una publicación que perdería en silencio todas las reglas de visibilidad se rechaza",
          versionsRuleGuardContent:
            "Las reglas de visibilidad se clonan en el borrador en el momento en que se genera, y no se vuelven a obtener al publicar, así que para cuando ocurre una publicación normalmente ya no queda nada que perder. El único caso para el que existe esta salvaguarda es aquel en el que la versión saliente sí tiene reglas y el borrador no tiene ninguna: la publicación se rechaza de plano, en lugar de volver visible sin condiciones —y en silencio— cada campo condicionalmente oculto de ese tipo de registro.",

          retireTitle: "Retirar un campo: desactivar o eliminar",
          retireIntro:
            "No son la misma operación y la diferencia importa. Si tienes dudas, desactiva: es la reversible.",
          deactivateTitle: "Desactivar Active",
          deactivate1: "El campo deja de ofrecerse en los formularios de creación y edición",
          deactivate2: "Toda respuesta ya almacenada se conserva, intacta",
          deactivate3: "Es reversible: volver a activar Active restaura el campo tal como estaba",
          deactivate4:
            "Se registra en el historial como Deactivated, y se puede Reactivate más adelante",
          deleteColTitle: "Eliminar la definición",
          deleteCol1: "Se rechaza en el primer intento si el campo tiene alguna respuesta",
          deleteCol2:
            "Destruye esas respuestas una vez transcurrido el periodo de retención, si lo confirmas",
          deleteCol3:
            "Libera la clave, de modo que un campo nuevo podría reutilizarla más adelante, sin ninguna de las respuestas antiguas",
          deleteCol4:
            "Se registra en el historial como Deleted, y se puede Restore mientras sea recuperable",

          historyTitle: "Historial de la definición",
          historyIntro:
            "La entrada History del menú de fila de un campo abre un cuadro que lista lo que le ha ocurrido a la definición de ese campo, de lo más reciente a lo más antiguo, con la persona que lo hizo y cuándo. Un cambio hecho por el sistema y no por una persona se atribuye al sistema. Las entradas están paginadas, y el cuadro indica cuántos cambios hay en total.",
          thEvent: "Evento",
          thMeans: "Qué significa",
          evCreated: "El campo se definió.",
          evUpdated:
            "Algo cambió en la definición: una etiqueta, un indicador, el validador, las opciones.",
          evDeactivated: "Se desactivó Active, retirando el campo sin tocar sus respuestas.",
          evReactivated: "Se volvió a activar Active.",
          evDeleted: "La definición se eliminó y todavía es recuperable.",
          evRestored: "Una definición eliminada se recuperó.",
          evPurged:
            "La definición se eliminó de forma permanente y ya no es recuperable. El cuadro marca este caso explícitamente para que no se lea como una eliminación ordinaria.",
          historyParts:
            "Cada entrada también indica a qué parte del campo se refiere, porque un campo es más que una sola fila.",
          thPart: "Parte",
          partField: "El propio campo.",
          partDefinition: "El registro de definición que hay detrás.",
          partVersion: "Una versión de la definición.",
          partOption: "Una entrada de la lista de opciones del campo.",
          partVisibilityRule:
            "Una regla condicional de mostrar u ocultar asignada al campo, gestionada mediante el cuadro Reglas de Visibilidad.",
          historyScopeTitle: "El historial cubre la definición, nunca las respuestas",
          historyScopeContent:
            "Este cuadro no te va a decir quién cambió la nacionalidad de una persona concreta, y no está pensado para eso. Listar aquí los cambios de valores lo convertiría en una copia legible de los datos de cualquiera, saltándose de una vez la seguridad a nivel de campo y cualquier otra regla de visibilidad. Solo son elegibles los cambios del lado de la definición, y los registros que llevan valores se excluyen por nombre y no por omisión.",
          historyUnavailableTitle: "Si el historial indica que el módulo no está disponible",
          historyUnavailableContent:
            "Eso es una característica del despliegue y no un fallo del campo: el almacén de auditoría vive en otro módulo, y este despliegue funciona sin él. Tampoco se registró ningún historial durante ese periodo. Es cosa de quien administre el despliegue, no algo que puedas arreglar desde la pantalla. El historial de un campo global de la plataforma está además restringido por separado a los administradores de la plataforma, y muestra un mensaje distinto.",

          usageTitle: "Uso e impacto",
          usageIntro:
            "La entrada Usage & impact del menú de fila informa de lo que realmente contiene el campo antes de que lo cambies o lo elimines. Lee el cuadro entero y no un único número.",
          thReading: "Qué muestra",
          readStoredValues: "Valores almacenados",
          readStoredValuesMeans: "Cuántas respuestas existen para este campo.",
          readLegacyValues: "Valores en el almacén heredado",
          readLegacyValuesMeans:
            "Respuestas que todavía están en el almacenamiento anterior, previo al almacén de valores actual. Se cuentan por separado para que una migración en curso sea visible y no quede oculta.",
          readOptions: "Opciones",
          readOptionsMeans:
            "Cuántas opciones tiene la lista del campo, para un campo Select o MultiSelect.",
          readByRecordType: "Por tipo de registro",
          readByRecordTypeMeans:
            "El mismo recuento de respuestas repartido por el tipo de registro que las contiene, para que veas dónde están realmente los datos.",
          readAffectedOrgs: "Organizaciones con valores",
          readAffectedOrgsMeans:
            "Para un campo global de la plataforma, cuántos espacios de trabajo tienen respuestas para él. Este es el número que hace que una eliminación tenga consecuencias reales.",
          readScopeNotice: "El aviso de alcance de arriba",
          readScopeNoticeMeans:
            "Indica si los recuentos de abajo cubren solo tu espacio de trabajo o el conjunto entero de la plataforma. Los dos difieren en órdenes de magnitud para un campo heredado, y un número desnudo no te dice cuál de los dos estás viendo.",
          usageWarnTitle: "Confía en la advertencia, no en el número",
          usageWarnContent:
            "La frase «esto destruirá datos» procede del propio veredicto del servidor, nunca del recuento en pantalla. Un campo global de la plataforma se mide en cada espacio de trabajo que lo heredó, así que puede mostrar cero en tu propio espacio de trabajo y aun así advertirte, correctamente. La advertencia es lo que hay que creer.",

          deleteTitle: "Eliminar sin destruir datos",
          deleteIntro:
            "Eliminar un campo que tiene respuestas exige dos pasos deliberados. Un campo sin respuestas exige uno.",
          d1Title: "Abre primero Usage & impact",
          d1Content:
            "Comprueba cuántas respuestas existen y dónde están. Si el número te sorprende, detente aquí: casi siempre es mejor desactivar el campo.",
          d2Title: "Elige Delete",
          d2Content:
            "Si el campo tiene respuestas, la eliminación se rechaza con un conflicto y el cuadro explica exactamente qué se perdería, indicando el número de valores almacenados y el número de tipos de registro.",
          d3Title: "Confirma la eliminación destructiva",
          d3Content:
            "Confirmar desde dentro de ese cuadro es lo que realmente la lleva a cabo. Es un acto separado y explícito, y no un segundo clic sobre el mismo botón, para que un campo con datos no se pueda eliminar por inercia.",
          d4Title: "O elimina un campo vacío en un solo paso",
          d4Content:
            "Un campo sin respuestas se elimina sin ningún aviso y sin ningún paso adicional, porque no hay nada que perder.",
          deleteRetention:
            "Una eliminación confirmada destruye las respuestas almacenadas una vez transcurrido el periodo de retención, no al instante. Hasta entonces la definición todavía se puede Restore, y el historial registra tanto la eliminación como la restauración. Pasado el periodo, las respuestas desaparecen y la entrada del historial se lee como Purged.",

          exportTitle: "Exportar definiciones a una hoja de cálculo",
          exportIntro:
            "La acción Export del encabezado de la página Custom Fields descarga una hoja de cálculo con las definiciones que puedes ver, una fila por campo con los encabezados en la primera fila. Estas son las 18 columnas.",
          thColumn: "Columna",
          thContains: "Contiene",
          colEntityType: "El tipo de registro contra el que está definido el campo.",
          colKey: "La clave técnica del campo.",
          colLabelEn: "La etiqueta en inglés.",
          colLabelAr: "La etiqueta en árabe, en blanco si no se fijó ninguna.",
          colValueType: "Uno de los veintidós tipos de valor.",
          colRequired: "Si el campo es obligatorio.",
          colActive: "Si el campo se sigue ofreciendo en los formularios.",
          colSortOrder:
            "La posición del campo entre los campos personalizados del tipo de registro.",
          colOptionsEn: "Las opciones en inglés, para un campo Select o MultiSelect.",
          colOptionsAr: "Las opciones en árabe, alineadas con las de inglés.",
          colSensitivity: "La etiqueta de clasificación fijada en la definición.",
          colExportable:
            "El ajuste Include in exports, indicado como Yes o No. Nunca se usa para filtrar este archivo: una exportación de definiciones que descartara filas ocultaría precisamente los campos que un administrador más necesita auditar.",
          colValidator: "El validador asignado, para un campo Text.",
          colValidatorParam: "El parámetro del validador, cuando admite uno.",
          colPlaceholderEn: "El texto de sugerencia en inglés.",
          colPlaceholderAr: "El texto de sugerencia en árabe.",
          colScope: "Platform para un campo global, Organisation para uno de espacio de trabajo.",
          colCreated: "Cuándo se creó la definición, en UTC.",
          exportBooleans:
            "Las columnas de sí/no se escriben como las palabras Yes y No en lugar de como booleanos de hoja de cálculo, así que sobreviven a abrirse en otro idioma y se siguen leyendo tal como se pretendía.",
          exportSafetyTitle: "Las etiquetas que parecen fórmulas se quedan en texto",
          exportSafetyContent:
            "Toda celda se escribe como texto inerte, nunca como fórmula. Un campo etiquetado =SUM(A1) llega al archivo como esos caracteres literales, no como un cálculo, y lo mismo ocurre con una etiqueta que empiece por +, -, @, o un tabulador seguido de =. Esto es categórico y no un filtro de casos conocidos.",
          exportLimitTitle: "Tres límites en la exportación",
          exportLimitContent:
            "Contiene definiciones y nunca las respuestas de nadie: una exportación de valores aparte, con su propio endpoint y su propio botón en el encabezado, es donde viven las respuestas propiamente dichas (ver Límites y Comportamientos). Pasadas las 10.000 definiciones se rechaza de plano, indicándote que acotes la exportación a un único tipo de registro, en lugar de entregarte un archivo truncado con apariencia de completo. Y las 18 columnas anteriores son el archivo entero: el Target Entity Type anclado de un campo de referencia no es una de ellas, así que una definición exportada no registra a qué apunta su campo. Los campos que tienes restringidos están ausentes del archivo en lugar de en blanco.",

          referenceTitle: "Las dos pantallas de referencia",
          referenceIntro:
            "Las dos se alcanzan desde enlaces en el encabezado de la página Custom Fields, las dos son de solo lectura, y las dos están protegidas por el mismo permiso de visualización que la propia pantalla Custom Fields. Ninguna tiene entrada propia en el menú lateral, y eso es deliberado.",
          valueTypesScreenTitle: "Value Types",
          valueTypesScreenIntro:
            "Una tabla con los veintidós tipos de valor y, para cada uno, una descripción de para qué sirve, si admite un texto de sugerencia, si tiene una lista de opciones propia, y si admite un validador. Úsala para responder «qué tipos existen» sin abrir un formulario de definición. Text es la única fila que muestra compatibilidad con validador, y los cuatro tipos con forma de referencia no muestran ninguna lista de opciones propia: lo que ofrecen procede de otro módulo, o de un archivo subido, y no de una lista que tú redactes.",
          entityTypesScreenTitle: "Entity Types",
          entityTypesScreenIntro:
            "Una lista de cada tipo de registro al que se puede asociar un campo personalizado: su nombre para mostrar, su clave, y el módulo que lo posee.",
          entityTypesScreenDrift:
            "También muestra dos columnas de pantalla independientes más un estado, lo cual no es una duplicación. Una es lo que la plataforma afirma sobre esta aplicación; la otra es lo que esta aplicación realmente tiene. La columna de estado indica si las dos coinciden, y una fila que dice Out of Sync es un defecto real que merece reportarse: significa que, o bien un campo apuntaba a un tipo de registro que nadie puede representar, o bien hay una pantalla que la plataforma no sabe que existe.",
          apiOnlyTitle: "Tipos de registro exclusivos de la API",
          apiOnlyContent:
            "Un tipo de registro sin pantalla propia en esta aplicación sigue siendo un destino legítimo para un campo personalizado. Se lista después de los que sí tienen pantalla en el formulario de definición, con el sufijo API only. Un campo definido contra uno de esos tipos se puede alcanzar a través de la API y no tiene absolutamente dónde representarse en la interfaz, lo cual está bien si era eso lo que pretendías, y es un misterio si no lo era.",
        },

        // ═══════════════════════════════════════════════════
        //  Limits and Behaviours
        // ═══════════════════════════════════════════════════
        limits: {
          title: "Límites y Comportamientos",
          description:
            "Cada límite fijo y cada limitación deliberada de los campos personalizados, cada una con el motivo de por qué es así, para que nadie se pase una tarde buscando un ajuste que no existe.",
          intro:
            "Esta página reúne cada límite con el que un administrador de campos personalizados puede razonablemente encontrarse, y explica por qué cada uno es como es. Lo que hay aquí describe el comportamiento actual y no es una promesa sobre el futuro. Un límite indicado con claridad sale más barato que un límite descubierto a las cuatro de la tarde.",

          numbersTitle: "Los números fijos",
          numbersIntro:
            "Estas son constantes del producto. Ninguna se puede subir ni bajar para un campo concreto, y solo la última varía en algo.",
          thLimit: "Límite",
          thValue: "Valor",
          thConfigurable: "¿Configurable?",
          limTextLength: "Longitud del campo Text, en caracteres",
          limLongTextLength: "Longitud del campo LongText, en caracteres",
          limMultiSelect: "Selecciones de MultiSelect por valor",
          limRating: "Escala de Rating, solo números enteros",
          limPercent: "Rango de Percent, ambos límites inclusive",
          limPhoneDigits: "Dígitos de Phone, después del + inicial",
          limCurrencyCode: "Longitud del código de Currency, letras mayúsculas",
          limDuration: "Límite superior de Duration",
          limReferencePage: "Registros por página en un selector de referencia",
          limReferencePageMax: "La página más grande que puede pedir un selector de referencia",
          limGroupReorder: "Grupos de campos por tipo de registro en una reordenación",
          limExportRows: "Definiciones por exportación a hoja de cálculo",
          limFieldsPerWorkspace: "Campos personalizados por espacio de trabajo",
          cfgNo: "No",
          cfgPlan: "Lo fija tu plan",
          valNoUpperBound: "Ninguno",
          valPlanQuota: "Cuota del plan: cero en la edición Free",

          validatorsTitle: "Comportamientos de los validadores",
          thBehaviour: "Comportamiento",
          thWhy: "Por qué",
          vTextOnly: "Los validadores solo se asignan a campos Text.",
          vTextOnlyWhy:
            "El argumento de seguridad de los patrones integrados se elaboró para una entrada de texto de una sola línea. Extenderlo a una entrada con otra forma exige rehacer ese análisis, y eso no es algo que se pueda colar en una versión de funcionalidades. Un campo Text con un validador es la respuesta cuando necesitas una dirección de correo con restricciones adicionales.",
          vNoRetro: "Asignar un validador nunca vuelve a comprobar las respuestas ya guardadas.",
          vNoRetroWhy:
            "La validación se ejecuta en un único lugar: la ruta de guardado. Nada recorre los datos históricos cuando se asigna un validador nuevo, así que un campo puede contener legítimamente valores que su propio validador actual rechazaría, hasta que alguien los vuelva a introducir.",
          vWhitespace:
            "Un valor hecho solo de espacios se salta por completo la validación salvo que el campo sea Required.",
          vWhitespaceWhy:
            "La comprobación de vacío se ejecuta antes que cualquier comprobación de tipo o de validador. En un campo opcional, un valor hecho solo de espacios se almacena por tanto como borrado sin ningún error de validador en absoluto. Marca el campo como Required si una respuesta en blanco debe rechazarse.",
          vNoRegex: "No hay ningún cuadro de patrón o expresión regular en ningún sitio.",
          vNoRegexWhy:
            "Un patrón escrito a mano se puede construir para que consuma una cantidad enorme de tiempo de procesamiento con una entrada corta, convirtiendo un formulario de entrada de datos en una forma de tumbar el sistema. Las 13 comprobaciones seleccionadas existen precisamente para que nadie tenga que redactar una.",
          vNoFilter: "La lista de definiciones no se puede filtrar ni buscar por validador.",
          vNoFilterWhy:
            "No se construyó ninguna vista así. Para ver qué validador usa un campo, abre el formulario de definición de ese campo.",
          vNoReference: "No hay ninguna referencia navegable de validadores dentro del producto.",
          vNoReferenceWhy:
            "Los tipos de valor y los tipos de registro tienen cada uno su propia pantalla de referencia de solo lectura; los validadores no. El desplegable del formulario de definición de un campo Text es la única lista dentro del producto.",
          vNoChecksumEgUae:
            "Las comprobaciones de identidad egipcia y emiratí verifican la estructura pero no un dígito de control.",
          vNoChecksumEgUaeWhy:
            "Ninguno de los dos países publica un algoritmo de dígito de control, y las conjeturas de la comunidad encontradas durante la investigación no coincidían entre sí. Un algoritmo equivocado rechazaría identidades reales y válidas, que es peor que no comprobar el último dígito en absoluto.",
          vNoAe: "Postal Code no admite los Emiratos Árabes Unidos.",
          vNoAeWhy:
            "Los Emiratos no tienen un sistema nacional de códigos postales, así que no hay nada contra lo que validar. Intentarlo se rechaza con su propio mensaje explicativo y no con uno genérico.",

          typesTitle: "Comportamientos de los tipos de valor",
          tValueTypeFixed:
            "La clave, el tipo de registro y el alcance nunca se pueden cambiar una vez guardado un campo.",
          tValueTypeFixedWhy:
            "Cambiar la clave, el tipo de registro o el alcance después de guardado haría que cada respuesta ya almacenada resultara ambigua sobre lo que significa. El tipo de valor es la única excepción, con una vía de escape estrecha: nueve pares de tipos concretos se pueden convertir después — ver Gestión de Campos —; cualquier otro caso sigue significando eliminar y volver a crear.",
          tMultiOrder:
            "Una respuesta MultiSelect se lee de vuelta en el orden de selección, no en el orden de las opciones.",
          tMultiOrderWhy:
            "Conservar el orden en que alguien eligió es lo que hace que el valor se conserve con fidelidad. El coste es que una columna de lista que muestre esa respuesta no tiene garantizado seguir el orden en que redactaste las opciones.",
          tLongTextNoBlock:
            "LongText te deja seguir escribiendo más allá de su límite de 10.000 caracteres.",
          tLongTextNoBlockWhy:
            "El contador en pantalla se pone rojo, pero no hay ningún bloqueo antes de enviar como el que MultiSelect aplica en la vigésima selección. El rechazo llega al guardar.",
          tCurrencyShape: "Un código de Currency solo se comprueba en su forma.",
          tCurrencyShapeWhy:
            "No hay en el producto ninguna lista autorizada de códigos de moneda reales contra la que comprobar, y un espacio de trabajo puede necesitar legítimamente cualquiera de los aproximadamente 180 reales. Tres letras mayúsculas son por tanto toda la comprobación, y un código con buena forma pero inexistente, como ZZZ, se acepta.",
          tCurrencyPlain: "Currency almacena un importe simple, nunca unidades menores.",
          tCurrencyPlainWhy:
            "Sigue la misma convención que cualquier otro importe monetario del producto. 100.50 se almacena como 100.50, nunca como 10050, lo cual importa si alguna vez lees los datos en bruto o construyes un informe con ellos.",
          tDurationMinutes: "La unidad de Duration siempre son minutos, y no tiene máximo.",
          tDurationMinutesWhy:
            "Los minutos son la convención que ya usan las partes de programación y reservas del producto para los datos con forma de duración, y el formulario etiqueta la unidad de forma visible en lugar de dejar un número desnudo. Solo se rechazan los valores negativos; no hay límite superior ni ninguna forma de fijar uno por campo.",
          tRatingSlider:
            "Un campo Rating sin tocar muestra su control deslizante en 1 aun estando vacío.",
          tRatingSliderWhy:
            "Un control deslizante siempre necesita un número real para posicionar su indicador. No se envía nada hasta que alguien lo mueve de verdad, así que el campo se guarda genuinamente como vacío, pero parece un 1 hasta que lo sabes.",
          tRatingZero: "Un Rating de 0 se rechaza en lugar de tratarse como sin valorar.",
          tRatingZeroWhy:
            "Sin valorar significa que el campo se dejó genuinamente vacío. Un 0 enviado explícitamente es un valor real que no supera la comprobación de 1 a 5 exactamente igual que lo haría un 6, y recibe el mismo mensaje.",
          tPhoneShape: "Phone valida la forma, no si el número podría existir de verdad.",
          tPhoneShapeWhy:
            "El servidor solo comprueba la gramática internacional. El propio selector del formulario además comprueba los dígitos contra el plan de numeración real del país seleccionado, así que el hueco solo se alcanza con una solicitud que se salte el formulario: una limitación de calidad de los datos aceptada y no una de seguridad.",
          tPhoneFlag:
            "La bandera de país que muestra Phone puede ser incorrecta en un código de llamada compartido.",
          tPhoneFlagWhy:
            "Algunos códigos de llamada los comparten varios países, y no hay ninguna columna de país independiente: la bandera se deriva del propio número. El número almacenado no se ve afectado; solo la bandera de al lado puede elegir el país equivocado dentro de un código compartido.",
          tColorShorthand: "Color nunca unifica las formas de tres y de seis dígitos.",
          tColorShorthandWhy:
            "Las dos son válidas y las dos se conservan exactamente tal como se enviaron, así que el mismo color se puede almacenar de dos formas distintas en registros diferentes. Solo las mayúsculas se normalizan, siempre a minúsculas.",
          tTimeText: "Time se almacena como texto canónico y no como una hora de base de datos.",
          tTimeTextWhy:
            "Una elección de almacenamiento deliberada, hecha para no repetir un problema de ordenación conocido que tiene en una base de datos una columna de hora ya existente en otra parte del producto. Una entrada sin ceros a la izquierda se acepta y se normaliza, así que dos formas de escribir la misma hora siempre acaban coincidiendo.",
          tPercentStorage: "Percent almacena el número que dirías en voz alta, no una fracción.",
          tPercentStorageWhy:
            "25 se almacena como 25 y se muestra como 25%. Nunca es 0,25, y la visualización añade el signo en lugar de aplicar un formateador basado en fracciones, precisamente para que un 25 nunca pueda mostrarse como 2500%.",
          tTextNotTrimmed: "Text no recorta los espacios que lo rodean; Select sí.",
          tTextNotTrimmedWhy:
            "Un valor Text se almacena exactamente tal como se envió, porque un espacio inicial o final puede tener significado en un texto libre. Un valor Select se recorta por los dos lados antes de compararse con las opciones, así que un espacio suelto nunca provoca un rechazo espurio.",
          tOracleBytes:
            "Un texto largo en árabe se puede rechazar por debajo del límite de caracteres indicado en una de las bases de datos.",
          tOracleBytesWhy:
            "El límite de 4.000 caracteres de Text es un recuento exacto de caracteres en dos de las tres bases de datos admitidas. En la tercera se cuenta en bytes, así que un texto multibyte —el árabe incluido— puede alcanzar el límite antes. Usa LongText si estás cerca del límite.",

          referencesTitle: "Comportamientos de las referencias",
          fNoStoredName: "Una referencia nunca almacena el nombre del registro al que apunta.",
          fNoStoredNameWhy:
            "Un nombre almacenado quedaría dentro del registro que contiene el campo, y por tanto sería legible por cualquiera que pueda leer ese registro, mientras que el propio nombre lo protege el permiso del destino. No hay ningún ajuste para activar esto, y no lo habrá. El beneficio compensatorio es que un nombre corregido en su propio registro queda corregido de inmediato en cada sitio donde se referencia.",
          fIdOpaque:
            "La identidad del registro referenciado es opaca y debe devolverse sin cambios.",
          fIdOpaqueWhy:
            "Es la clave de otro módulo, cifrada para el transporte, y nada en ella está pensado para leerse o remodelarse. Un carácter alterado y el producto informa correctamente de que la referencia almacenada es incorrecta. Devuelve exactamente la cadena que recibiste.",
          fSameNames: "Una referencia se escribe bajo los mismos dos nombres con los que se lee.",
          fSameNamesWhy:
            "No hay ninguna asimetría entre la forma de lectura y la forma de escritura. Cualquiera que integre contra la API de valores debería repetir exactamente los dos nombres de propiedad que se le dieron; inventar un nombre distinto para la identidad al enviarla produce un guardado que en silencio no lleva ningún puntero, y que después se rechaza como una referencia incompleta.",
          fFiveFailures: "Una referencia que no se muestra indica cuál de cinco cosas ha ocurrido.",
          fFiveFailuresWhy:
            "Sin permiso, registro desaparecido, valor incorrecto, una búsqueda que acaba de fallar, y un tipo de registro para el que esta instalación no puede responder son cinco problemas distintos con cinco soluciones distintas. Mostrarlos como un único campo en blanco, sin distinción, es lo que deja un puntero a un registro eliminado pasando desapercibido durante un año.",
          fMergedAnswers:
            "«Eliminado» y «en un espacio de trabajo que no puedes ver» son una única respuesta.",
          fMergedAnswersWhy:
            "Distinguirlos permitiría a alguien probar identidades una a una para descubrir qué existe en otro espacio de trabajo. «No tienes permiso para ver este tipo de registro» se distingue de las dos, porque describe el propio acceso del lector y no revela nada.",
          fDeleteClears:
            "Eliminar un registro referenciado borra cualquier puntero que apunte a él y conserva toda fila de valor.",
          fDeleteClearsWhy:
            "Las dos partes de cada respuesta afectada se borran juntas, nunca una sin la otra. No se elimina nada: la respuesta conserva su fila, su versión y su historial de auditoría, así que el campo después se lee como genuinamente vacío y no como roto.",
          fNoBacklinks: "Nada lista las referencias que apuntan a un registro dado.",
          fNoBacklinksWhy:
            "No existe en ningún sitio una vista de «qué apunta a esto», y eliminar un registro no avisa de cuántos punteros está a punto de borrar. El borrado es silencioso porque es seguro, no porque esté oculto.",
          fLimitedTargets: "Actualmente solo se pueden referenciar tres tipos de registro.",
          fLimitedTargetsWhy:
            "Miembros del personal, cuentas de usuario y personas del módulo de terceros: los tipos cuyo módulo propietario ofrece una lista con búsqueda y comprobación de permisos. Cualquier otro se rechaza en lugar de responderse con una lista vacía, porque una lista vacía parece un resultado correcto y diría «no hay ninguno de estos» cuando la verdad es «esto no se puede preguntar».",
          fNoAdminTarget: "Los registros de administrador no se pueden referenciar en absoluto.",
          fNoAdminTargetWhy:
            "Un administrador puede no pertenecer a ningún espacio de trabajo —un administrador de la plataforma no tiene ninguno—, así que un puntero a uno de ellos podría llegar más allá de cualquier límite de espacio de trabajo del producto. Un campo User Reference rechaza uno de plano, y el formulario de definición nunca ofrece ninguno.",
          fUnpinnedIsLegal:
            "Dejar un campo de referencia sin anclar es un estado permanente y admitido.",
          fUnpinnedIsLegalWhy:
            "Significa «cualquier tipo que esta persona pueda referenciar», y cada respuesta registra qué tipo eligió. Nunca debe leerse como «nada configurado, por tanto nada válido»; el formulario del registro lo gestiona pidiendo primero el tipo de registro y después el registro.",
          fPopulatedUnpinned:
            "Un campo sin anclar ya rellenado no ofrece ninguna forma de cambiar el tipo de registro.",
          fPopulatedUnpinnedWhy:
            "El propio tipo de la respuesta almacenada se usa para el selector, así que volver a elegir queda limitado a ese tipo. Borrar el campo hace que vuelva el control de tipo. Es un límite real y no un defecto, y es la forma de esta funcionalidad con más probabilidades de reportarse como uno.",
          fNotExported: "Un tipo de destino anclado no está en la exportación de definiciones.",
          fNotExportedWhy:
            "La hoja de cálculo tiene 18 columnas y ninguna de ellas es el tipo de destino, así que una definición exportada no registra a qué apunta su campo.",
          fSingleValue: "Un campo de referencia contiene exactamente un puntero.",
          fSingleValueWhy:
            "No existe un tipo de referencia multivalor. Dos respuestas significan dos campos, y Multi-Select no puede apuntar a registros: sus respuestas son texto que tú redactaste.",

          optionsTitle: "Comportamientos de las opciones",
          oTextIsValue: "El texto de la opción en inglés es la respuesta almacenada.",
          oTextIsValueWhy:
            "No hay ningún código independiente detrás de una opción, así que renombrarla cambia lo que muestra cada registro existente. Prefiere añadir una opción nueva y retirar la antigua cuando la distinción importe.",
          oCaseSensitive:
            "La comparación de opciones es exacta y distingue mayúsculas de minúsculas.",
          oCaseSensitiveWhy:
            "Dos opciones que solo difieran en mayúsculas y minúsculas son un par legítimamente distinto, y unificar las mayúsculas las haría coincidir. Los dos lados se recortan primero, así que solo importan las mayúsculas y minúsculas y el contenido.",
          oEnglishStored: "La etiqueta en árabe de una opción es solo para mostrarse.",
          oEnglishStoredWhy:
            "Las dos listas de etiquetas se emparejan fila por fila, y la de inglés es la que se graba en el registro y contra la que se valida. Un lector árabe ve árabe tanto al elegir como al consultarlo después; el dato subyacente se mantiene como un único valor consistente.",
          oNoSharedSets:
            "La lista de opciones integrada de un campo es suya propia: compartirla es un paso aparte y deliberado.",
          oNoSharedSetsWhy:
            "Escribir una lista Options en un campo la mantiene privada para ese campo; no se reutiliza automáticamente en ningún otro sitio. Sin embargo, una lista de países que necesiten tres campos ya no hay que escribirla y mantenerla tres veces: vincula los tres al mismo Option Set compartido y versionado, y una edición posterior del conjunto actualiza a la vez cada campo vinculado.",

          groupsTitle: "Comportamientos de los grupos de campos",
          gStableKeyFixed: "La clave estable de un grupo nunca la puede cambiar nadie.",
          gStableKeyFixedWhy:
            "El esquema exportado nombra un grupo por esta clave, así que renombrarla convertiría en silencio una futura reimportación de una actualización en una creación, contra un paquete ya distribuido. Una clave equivocada significa volver a crear el grupo.",
          gReorderCeiling: "Reordenar rechaza más de 100 grupos en un mismo tipo de registro.",
          gReorderCeilingWhy:
            "Una solicitud de reordenación lleva de una vez el conjunto entero. Más allá de 100, no se puede mover ningún grupo de ese tipo de registro: la pantalla lo indica en lugar de fallar de forma genérica.",
          gGlobalOrdering: "Un espacio de trabajo no puede situar su grupo respecto a uno global.",
          gGlobalOrderingWhy:
            "Reordenar funciona en bloque, sin términos medios, y rechaza cualquier grupo que quien llama no posea, así que los propios grupos de un espacio de trabajo se renumeran desde cero. Esos números pueden coincidir con los de un grupo global, el empate se resuelve por la etiqueta en inglés, y el efecto visible es que mover tu grupo al principio puede dejarlo por debajo de uno global.",
          gSeparatePerms: "Los grupos de campos necesitan sus propios permisos.",
          gSeparatePermsWhy:
            "Están controlados por separado de las definiciones de campo, incluido un permiso propio para reordenar. Un rol que tiene cada uno de los permisos de campos personalizados no los obtiene automáticamente, y sin ellos el enlace y el selector simplemente están ausentes.",
          gOneEntityType: "Un grupo pertenece a exactamente un tipo de registro.",
          gOneEntityTypeWhy:
            "No se lista nada hasta que eliges un tipo de registro, y cambiar el tipo de registro de un campo borra su grupo, porque un grupo de un tipo nunca es válido para otro.",
          gUniquenessIndex:
            "En una base de datos actualizada, la unicidad de la clave estable descansa en la comprobación de la aplicación.",
          gUniquenessIndexWhy:
            "Los grupos que existían antes de las claves estables llevan una clave vacía hasta que se ejecuta un relleno retroactivo, y la restricción de unicidad a nivel de base de datos permanece desactivada hasta que eso haya ocurrido en todas partes; de lo contrario rechazaría la segunda de esas claves vacías.",

          securityTitle: "Comportamientos de seguridad y clasificación",
          sSensitivityLabel: "Sensitivity es una etiqueta, no un control de acceso.",
          sSensitivityLabelWhy:
            "Se almacena, se conserva al leer y escribir, y se puede incluir en informes, y no cambia nada sobre quién puede leer un valor. La seguridad a nivel de campo es el mecanismo que restringe el acceso, y los dos no tienen relación.",
          sRestrictedByResource:
            "Las restricciones se identifican por recurso de permiso, no por tipo de registro.",
          sRestrictedByResourceWhy:
            "Es el mismo recurso que ya protege el propio registro, así que una única lista de campos restringidos cubre tanto los campos propios de una pantalla como sus campos personalizados. Los nombres se comparan sin distinguir mayúsculas de minúsculas.",
          sRestrictedInvisible: "Un campo restringido está ausente, no en blanco.",
          sRestrictedInvisibleWhy:
            "Mostrar un texto de sugerencia revelaría que existe un valor, lo que ya es información en sí misma. La consecuencia es que un campo restringido es indistinguible de uno que nunca se definió; conviene recordarlo cuando alguien reporte que falta un campo.",
          sRejectWholeSave: "Escribir un campo restringido rechaza el guardado entero.",
          sRejectWholeSaveWhy:
            "Descartar en silencio ese único campo e informar de éxito es el fallo más difícil de notar. El rechazo también se produce cuando el valor enviado es igual al almacenado, así que nadie puede sondear un valor oculto probando qué se acepta.",
          sRequiredExclusive: "Obligatorio y restringido no se pueden combinar.",
          sRequiredExclusiveWhy:
            "Alguien que no puede ver un campo nunca podría satisfacerlo, así que el registro sería imposible de guardar para esa persona. Se rechazan las dos direcciones, se intente cual se intente primero, y el mensaje indica el campo.",
          sHistoryNoValues: "El historial de la definición nunca muestra cambios de valores.",
          sHistoryNoValuesWhy:
            "Incluirlos convertiría el cuadro en una copia legible de los datos de cualquiera, saltándose de una vez la seguridad a nivel de campo y cualquier otra regla de visibilidad. Los registros que llevan valores se excluyen por nombre y no por omisión.",

          exportTitle: "Comportamientos de exportación y portabilidad",
          eDefinitionsOnly:
            "La exportación a hoja de cálculo contiene definiciones, nunca respuestas.",
          eDefinitionsOnlyWhy:
            "Es una exportación de definiciones por diseño: existe una exportación de valores aparte, con su propio endpoint y su propio botón en el encabezado para las respuestas propiamente dichas, limitada a 10.000 celdas, que se rechaza en lugar de truncarse al superar ese límite.",
          eRefusesPastLimit:
            "Pasadas las 10.000 definiciones la exportación se rechaza en lugar de truncarse.",
          eRefusesPastLimitWhy:
            "Un archivo truncado en silencio es peor que ningún archivo, porque parece completo. El rechazo te indica que acotes la exportación a un único tipo de registro.",
          eRestrictedAbsent:
            "Los campos que tienes restringidos están ausentes del archivo, no en blanco.",
          eRestrictedAbsentWhy:
            "La seguridad a nivel de campo se aplica a la exportación exactamente igual que en pantalla, y una columna en blanco seguiría revelando que el campo existe.",
          eNoImport:
            "La exportación a hoja de cálculo es de un solo sentido, y la única vía de creación masiva que este producto ha ofrecido jamás está desactivada.",
          eNoImportWhy:
            "La hoja de cálculo exportada es un informe para leer, no una plantilla que se pueda volver a importar. Existe una importación de paquete de esquema en JSON —con su propio cuadro de diálogo, su propio endpoint y su propia tabla de resultados por grupo—, pero cada llamada a ella se rechaza con un 409 mediante un interruptor de contención deliberado y permanente, que bloquea igualmente la exportación de esquema correspondiente. La creación masiva de campos no está disponible hoy en el producto: es el diseño de ese interruptor, no una omisión.",
          eTextCells: "Toda celda de la exportación se escribe como texto.",
          eTextCellsWhy:
            "Una etiqueta que empiece por =, +, - o @ llega como caracteres literales y no como una fórmula de hoja de cálculo. Esto es categórico y no un filtro de casos conocidos, así que nada que parezca un cálculo puede convertirse en uno.",

          reachTitle: "Dónde aparecen y dónde no aparecen los campos",
          rApiOnlyTypes: "Algunos tipos de registro no tienen ninguna pantalla en absoluto.",
          rApiOnlyTypesWhy:
            "Son destinos legítimos y se listan en último lugar en el formulario de definición con el sufijo API only. Un campo definido contra uno de ellos se puede alcanzar a través de la API y no tiene dónde representarse en la interfaz.",
          rHandRolledForms: "Un puñado de pantallas conecta sus campos personalizados a mano.",
          rHandRolledFormsWhy:
            "La mayoría de las pantallas recogen los campos personalizados automáticamente. Unas pocas cuyas interfaces de creación y edición son anteriores a ese mecanismo —entre ellas webhooks, plantillas de mensajes, planes de espacio de trabajo, definiciones de plugins, leads y temas— implementan ellas mismas la misma sección Custom Fields. El comportamiento debería ser idéntico; si no lo es, merece la pena reportarlo.",
          rDsrCreateOnly:
            "Las solicitudes de interesados solo admiten campos personalizados al crear.",
          rDsrCreateOnlyWhy:
            "Una solicitud enviada avanza por un flujo de revisión en lugar de ser editable en general, así que no hay ningún formulario de edición al que llevar los campos personalizados. Eso es por diseño, no una omisión.",
          rDialogForms:
            "La mayoría de los formularios de creación y edición de registros siguen siendo cuadros de diálogo.",
          rDialogFormsWhy:
            "La propia redacción de campos personalizados salió de un cuadro de diálogo anidado y pasó a un panel lateral, que es por lo que añadir un campo desde dentro de un registro ya no apila dos cuadros de diálogo. Los formularios de registro que lo rodean se dejaron deliberadamente como estaban: moverlos es un cambio mucho más amplio, en módulos que no tienen nada que ver con los campos personalizados.",
          rNoSidebarEntry:
            "Las pantallas Value Types y Entity Types no tienen entrada en el menú lateral.",
          rNoSidebarEntryWhy:
            "La navegación del menú lateral se genera de forma centralizada, y estas dos se dejaron fuera de esa generación a propósito. En su lugar se alcanzan desde enlaces en el encabezado de la página Custom Fields.",

          absentTitle: "Cosas que el producto no hace",
          absentIntro:
            "Preguntadas con suficiente frecuencia como para merecer decirlas con claridad. Ninguna de ellas es un fallo que reportar.",
          absent1:
            "Los veintidós tipos de valor son el conjunto completo. Dos elementos que antes no estaban en esta lista ahora sí: File e Image almacenan un archivo o una imagen subidos, y RichText almacena prosa con formato; ver la página Tipos de Valor. Sin embargo, adjuntar un nuevo valor File o Image todavía no está disponible en el producto; ambos se pueden definir hoy, y un valor ya existente solo se puede consultar o borrar.",
          absent2:
            "La exportación de valores se rechaza en lugar de truncarse en cuanto una solicitud superaría las 10.000 celdas; exporta un conjunto más reducido de registros en lugar de esperar un archivo parcial.",
          absent3:
            "Existe una vía de creación masiva, una importación de paquete de esquema en JSON con su propio cuadro de diálogo, pero un interruptor de contención la mantiene desactivada: rechaza de plano cualquier llamada en lugar de crear nada, igual que ocurre con la exportación de esquema correspondiente. Hoy, en la práctica, los campos se siguen creando de uno en uno en el formulario.",
          absent4:
            "Una versión publicada de un option set no traslada automáticamente los campos ya vinculados a una anterior: un administrador tiene que revincular cada campo explícitamente. Esto es deliberado: seguir el cambio automáticamente cambiaría en silencio el significado de los valores ya guardados contra la lista antigua.",
          absent5:
            "No hay ningún mostrar-u-ocultar condicional que un administrador pueda configurar. Un campo está en el formulario o no lo está, sujeto a Active y a la seguridad a nivel de campo.",
          absent6:
            "No hay cálculo, ni valor por defecto, ni regla entre campos. Un campo personalizado registra una respuesta; no deriva ninguna.",
          absentInfoTitle: "Si necesitas alguna de estas cosas",
          absentInfoContent:
            "Coméntaselo a quien lleve tu hoja de ruta de producto en lugar de esquivarlo de una forma que te cueste datos. Volver a crear un campo para cambiar algo permanente destruye las respuestas ya registradas contra él, y ese es el error costoso que esta página existe para evitar.",
        },

        // ═══════════════════════════════════════════════════
        //  Option Sets (shared, versioned lists)
        // ═══════════════════════════════════════════════════
        optionSets: {
          title: "Conjuntos de Opciones",
          description:
            "Listas de opciones reutilizables y versionadas. Vincula muchos campos a un mismo conjunto, y cada campo que lo usa cambia a la vez.",
          intro:
            "Un conjunto de opciones (Option Set) es una colección de opciones con nombre y versionada que comparten varios campos personalizados Select y MultiSelect. En lugar de que cada campo mantenga su propia lista de opciones integrada y privada, los campos se vinculan a una versión del conjunto de opciones. Cuando los requisitos del negocio evolucionan, un administrador crea una versión nueva, actualiza las opciones, y la publica, actualizando de inmediato cada campo vinculado en el producto entero sin tener que actualizarlos uno por uno a mano.",
          whenToUseTitle: "Cuándo usar un Option Set frente a opciones integradas",
          whenToUseContent:
            "Usa un Option Set siempre que la misma lista de opciones se necesite en más de un campo (por ejemplo, códigos de país, niveles de prioridad, o listas de departamentos), o cuando necesites un historial de versiones auditable y una publicación por etapas. Usa opciones integradas cuando una lista de opciones sea exclusiva de un solo campo y nunca se vaya a reutilizar.",

          kindsTitle: "Tres tipos de Conjuntos de Opciones",
          kindsIntro:
            "SCRIPE distingue tres tipos de conjuntos de opciones según su origen, su propiedad y sus reglas de editabilidad:",
          thKind: "Tipo",
          thOwner: "Propietario",
          thWhoCanEdit: "Quién puede editarlo",
          thScope: "Alcance",
          kindSeeded: "Predefinido (mantenido por la plataforma)",
          ownerPlatform: "Plataforma",
          editNobody: "Nadie (solo lectura)",
          scopeGlobal: "Global (cada espacio de trabajo)",
          kindPlatform: "Creado por la plataforma",
          editPlatformAdmin: "Administradores de la plataforma",
          scopeGlobalOrTenant: "Global o limitado a un espacio de trabajo",
          kindTenant: "Creado por el espacio de trabajo",
          ownerTenant: "Espacio de trabajo",
          editTenantAdmin: "Administradores del espacio de trabajo",
          scopeTenantOnly: "Solo ese espacio de trabajo",
          seededReadOnlyTitle: "Por qué los conjuntos predefinidos son de solo lectura",
          seededReadOnlyContent:
            "Los conjuntos predefinidos (como los códigos de país ISO 3166-1 y las monedas ISO 4217) están marcados como gestionados por el sistema. El servidor rechaza terminantemente cualquier acción que los modifique —crear versiones de borrador, editar opciones, publicar o eliminar— para cualquier persona, Super Admins incluidos. Si necesitas una variante personalizada de una lista predefinida, crea en su lugar tu propio conjunto de espacio de trabajo o de plataforma.",

          lifecycleTitle: "Ciclo de vida y estados de las versiones",
          lifecycleIntro:
            "Cada conjunto de opciones gestiona sus opciones mediante versiones inmutables. Una versión atraviesa cuatro estados discretos de su ciclo de vida:",
          thStatus: "Estado",
          thMeaning: "Significado",
          thNextState: "Siguiente estado",
          statusDraft: "Draft",
          meaningDraft:
            "Una versión de borrador editable. Se pueden añadir, actualizar, reordenar o desactivar opciones. No es visible en los formularios de registro activos hasta que se publica.",
          nextDraft: "Published (mediante la acción Publish)",
          statusPublished: "Published",
          meaningPublished:
            "La versión activa y en vivo. Los campos vinculados muestran exactamente estas opciones en los formularios de creación y edición. Inmutable.",
          nextPublished: "Deprecated (cuando se publica un borrador más reciente)",
          statusDeprecated: "Deprecated",
          meaningDeprecated:
            "Sustituida por una versión publicada más reciente. Los registros históricos que referencian opciones de esta versión se siguen mostrando correctamente. No se puede vincular a campos nuevos.",
          nextDeprecated: "Archived (al retirarse)",
          statusArchived: "Archived",
          meaningArchived:
            "Retirada de forma permanente del uso activo. Se conserva estrictamente para fines de auditoría histórica. Inmutable.",
          nextArchived: "Ninguno (estado terminal)",
          lifecycleOnlyOnePublished:
            "Solo puede haber una versión Published en cada momento. Publicar un borrador desactualiza automáticamente la versión vigente hasta entonces, en una única operación atómica.",
          publishSwapTitle: "Sustitución atómica al publicar",
          publishSwapContent:
            "Cuando publicas un borrador nuevo, la versión publicada actual se sustituye y se marca como Deprecated de inmediato. No se pierde ningún dato: los registros que ya habían guardado valores de la versión anterior se conservan intactos y muestran sus etiquetas almacenadas.",

          draftTitle: "Crear y editar una versión de borrador",
          draftIntro:
            "Para añadir o modificar opciones en un conjunto de opciones, sigue el flujo de versionado por etapas:",
          draft1:
            "Haz clic en Create draft version en el panel de detalle del conjunto de opciones. Se inicializa un borrador nuevo.",
          draft2:
            "Introduce una Key única y una etiqueta en inglés para cada opción. Las dos son obligatorias antes de que se habilite el guardado. Opcionalmente puedes aportar etiquetas en árabe, tonos de color, claves de icono, y órdenes de clasificación.",
          draft3:
            "Haz clic en Save draft para guardar la lista de opciones. El borrador se guarda en el servidor pero permanece sin exponerse a los formularios de registro activos.",
          draft4:
            "Cuando esté listo, haz clic en Publish version. La versión pasa a estar en vivo y cada campo vinculado ofrece de inmediato las opciones actualizadas.",
          draftSaveHintTitle: "Requisitos de validación de un borrador",
          draftSaveHintContent:
            "Un borrador exige al menos una opción válida con una Key y una etiqueta en inglés no vacías. Cada Key debe ser única dentro de la versión. El botón Save draft se habilita automáticamente en cuanto todas las filas cumplen estas reglas de validación.",

          bindingTitle: "Vincular campos a un Option Set",
          bindingIntro:
            "Los campos con tipo de valor Select o MultiSelect se pueden vincular a un conjunto de opciones en lugar de mantener opciones integradas: ya sea adjuntándolo en el mismo paso en que se crea el campo, en el propio formulario de creación, o mediante una de las tres acciones de ciclo de vida disponibles después en un campo que ya existe:",
          thAction: "Acción",
          thWhatItDoes: "Qué hace",
          thEffect: "Efecto sobre los datos existentes",
          actionBind: "Bind",
          doingBind:
            "Asigna la definición de un campo personalizado a la versión publicada de un conjunto de opciones.",
          effectBind:
            "El campo pasa de las opciones integradas a las opciones del conjunto de opciones. Los valores ya guardados se conservan.",
          actionSwitch: "Switch version",
          doingSwitch:
            "Hace que un campo vinculado apunte a una versión publicada más reciente del mismo conjunto de opciones, o de otro.",
          effectSwitch:
            "El campo empieza a ofrecer las opciones de la nueva versión. Los registros históricos siguen mostrando las opciones elegidas anteriormente.",
          actionDetach: "Detach (Unbind)",
          doingDetach:
            "Elimina la vinculación al conjunto de opciones, devolviendo el campo a opciones integradas independientes.",
          effectDetach:
            "El campo deja de consultar el conjunto de opciones. Los valores almacenados del registro permanecen intactos.",
          switchCautionTitle: "Estabilidad de la vinculación",
          switchCautionContent:
            "Al desvincular o cambiar de conjunto de opciones, asegúrate de que los valores existentes de los registros sigan siendo compatibles con las nuevas claves de opción. Desactivar una opción en lugar de eliminar su clave garantiza que los registros históricos se sigan mostrando sin interrupción.",

          platformAdminTitle: "Capacidades del administrador de la plataforma",
          platformAdminIntro:
            "Los Super Administradores de la plataforma operan con derechos de gobernanza elevados a escala del sistema entero:",
          platformAdmin1:
            "Crear conjuntos de opciones globales, compartidos por el conjunto de espacios de trabajo.",
          platformAdmin2:
            "Crear y publicar versiones nuevas de conjuntos de opciones propiedad de la plataforma (no predefinidos).",
          platformAdmin3:
            "Gestionar la disponibilidad de un conjunto de opciones a través de los límites entre distintos espacios de trabajo.",
          platformAdmin4:
            "Inspeccionar las cadenas de versiones y los registros de auditoría de cada conjunto de opciones de toda la plataforma.",
          platformAdmin5:
            "Respetar los límites gestionados por el sistema: los conjuntos predefinidos mantenidos por la plataforma siguen siendo inmutables también para los administradores de la plataforma.",
          platformContextTitle: "Detección del contexto de plataforma",
          platformContextContent:
            "Cuando se opera en la consola de gestión de la plataforma (sin entrar en un espacio de trabajo concreto), los conjuntos de opciones recién creados adoptan por defecto el alcance Global, quedando accesibles para cada entorno de espacio de trabajo.",

          rulesTitle: "Reglas operativas clave para recordar",
          rule1:
            "Los conjuntos de opciones se versionan, no se editan directamente: las opciones se modifican creando un borrador y publicándolo.",
          rule2:
            "Las claves son identificadores permanentes: una vez publicada una opción con una clave, no cambies esa clave en versiones posteriores si quieres que los valores existentes sigan correspondiéndose con ella.",
          rule3:
            "Desactiva en lugar de eliminar: desactivar una opción hace que deje de ofrecerse en los formularios nuevos, a la vez que se conserva en los registros históricos.",
          rule4:
            "Una única versión publicada: solo una versión está activa a la vez; publicar un borrador desactualiza automáticamente la versión anterior.",
          rule5:
            "Los conjuntos gestionados por el sistema son estrictamente de solo lectura: los conjuntos estándar predefinidos no los puede modificar ningún usuario ni administrador.",
        },
        encryption: {
          title: "Gestión de claves criptográficas y cifrado de sobre",
          description:
            "Cifrado de sobre multiinquilino de nivel empresarial, rotación del llavero raíz de plataforma, vinculación AAD de texto cifrado y reempaquetado de base de datos sin tiempo de inactividad.",
          intro:
            "Al almacenar campos personalizados confidenciales o secretos (como identificadores fiscales, tokens biométricos, datos bancarios o autorizaciones de seguridad), SCRIPE aplica cifrado de sobre de grado de hardware. Cada valor está protegido mediante AES-256-GCM con claves criptográficas exclusivas del inquilino derivadas mediante HKDF-SHA256 desde el llavero raíz activo de la plataforma. El texto cifrado no se puede falsificar, no se puede descifrar bajo otro inquilino o entidad y se puede reempaquetar de forma segura entre rotaciones de claves sin tiempo de inactividad.",
          archNoticeTitle: "Modelo de confianza cero empresarial",
          archNoticeContent:
            "El cifrado no es una ofuscación cosmética de la base de datos: el texto cifrado está vinculado criptográficamente a su inquilino, entidad y definición de campo mediante datos autenticados adicionales (AAD) de AES-GCM. Si un atacante altera un solo byte o copia el texto cifrado a otro registro, la autenticación falla inmediatamente.",
          archTitle: "Arquitectura criptográfica principal",
          archIntro:
            "El subsistema de cifrado está estructurado en cinco capas de seguridad resilientes:",
          featKeyringTitle: "Llavero raíz multiversión",
          featKeyringDesc:
            "Clave activa de plataforma para nuevas escrituras junto con un catálogo de claves históricas conservadas para lecturas fluidas sin tiempo de inactividad.",
          featDerivationTitle: "Derivación HKDF por inquilino",
          featDerivationDesc:
            "Claves secretas aisladas por inquilino derivadas deterministamente mediante HKDF-SHA256 con sal de código de inquilino y etiquetas de aplicación.",
          featEnvelopeTitle: "Trama binaria Magic Frame v2",
          featEnvelopeDesc:
            "Encabezado binario compacto que codifica la versión, el ID de clave de plataforma, la versión de clave del inquilino, un nonce de 96 bits y una etiqueta de autenticación de 128 bits.",
          featAadTitle: "Vinculación criptográfica AAD",
          featAadDesc:
            "El texto cifrado está vinculado matemáticamente a TenantId, EntityId y FieldDefinitionId, lo que impide ataques de inyección entre entidades.",
          featRewrapTitle: "Migración de reempaquetado en vivo en BD",
          featRewrapDesc:
            "Un worker en segundo plano itera por los registros de la base de datos utilizando lotes basados en cursor para volver a cifrar los datos bajo nuevas claves sin bloquear tablas.",
          featCliTitle: "Operaciones unificadas en CLI y Studio",
          featCliDesc:
            "Herramientas operativas integrales mediante `scripe crypto` y el panel visual para desarrolladores de SCRIPE Studio.",
          dualEnvelopeTitle: "Derivación de clave dividida de doble sobre",
          dualEnvelopeIntro:
            "SCRIPE aplica una separación criptográfica de conocimiento cero entre los operadores de la plataforma y los datos de los inquilinos mediante una jerarquía de claves divididas:",
          thComponent: "Componente de clave",
          thCustodian: "Almacenamiento y custodia",
          thRole: "Responsabilidad criptográfica",
          compPlatformKey: "KEK maestro de plataforma",
          custPlatform: "Entorno de host / KMS (`.env`)",
          rolePlatformKey:
            "Root Key Encryption Key (KEK). Cifra los secretos de inquilinos en reposo. Los operadores no pueden descifrar datos de inquilinos sin su secreto.",
          compTenantSecret: "Secreto criptográfico de inquilino",
          custTenantDb: "Base de datos del inquilino (`EncryptedTenantSecret`)",
          roleTenantSecret:
            "Secreto CSPRNG único de 256 bits generado por inquilino. Almacenado cifrado bajo el KEK de plataforma activo.",
          compSplitDek: "Clave de cifrado de datos derivada (DEK)",
          custRuntimeMemory: "Solo memoria efímera (HKDF)",
          roleSplitDek:
            "Derivada en tiempo de ejecución mediante HKDF-SHA256 de la combinación del secreto de inquilino y la clave de plataforma. Nunca se almacena en disco.",
          compAadBinding: "Etiqueta AAD contextual",
          custCipherEngine: "Sobre AES-256-GCM",
          roleAadBinding:
            "Vincula criptográficamente el texto cifrado a TenantId, EntityId y FieldId, evitando ataques de inyección entre registros.",
          autoProvisionTitle: "Aprovisionamiento automático sin fricción",
          autoProvisionContent:
            "Al crear un nuevo inquilino, `ITenantCryptographicProvisioner` aprovisiona automáticamente un secreto de 256 bits envuelto bajo el KEK de plataforma activo. Los inquilinos pueden registrar campos confidenciales de inmediato.",
          frameTitle: "Especificación de transmisión Magic Frame v2",
          frameIntro:
            "Los valores cifrados se persisten como tramas binarias compactas codificadas en base64 conformes con la especificación v2:",
          thByteOffset: "Desplazamiento en bytes",
          thField: "Campo de encabezado",
          thLength: "Longitud",
          thDescription: "Propósito criptográfico",
          descVersion: "Byte de versión Magic Frame (0x02 para tramas autenticadas v2).",
          descPlatformKey:
            "Entero de 32 bits en formato big-endian que identifica la clave raíz de plataforma en el llavero.",
          descTenantVersion:
            "Entero de 16 bits en formato big-endian que identifica la versión de rotación de clave del inquilino.",
          descNonce:
            "Vector de inicialización aleatorio criptográficamente seguro de 96 bits generado por operación de cifrado.",
          descAuthTag:
            "Etiqueta de autenticación GCM de 128 bits que verifica la integridad del texto cifrado y los datos AAD.",
          descCiphertext: "Carga útil del valor de campo cifrada con AES-256-GCM.",
          aadTitle: "Vinculación de datos autenticados adicionales (AAD)",
          aadContent:
            "Durante el cifrado y descifrado, el motor suministra `tenantId:entityId:fieldDefinitionId` como datos autenticados adicionales (AAD) al cifrador GCM. Esto garantiza que un número de identificación fiscal cifrado de la Empresa A no pueda ser copiado por un administrador malicioso en los registros de la Empresa B, ni transferido a otro campo dentro del mismo registro.",
          lifecycleTitle: "Ciclo de vida de claves y bloqueo estricto",
          lifecycleIntro:
            "Las operaciones de claves del inquilino siguen un ciclo de vida estricto y auditable diseñado para evitar fugas sin cifrar:",
          step1Title: "1. Bloqueo obligatorio de inicialización",
          step1Content:
            "Los administradores no pueden declarar campos personalizados 'Confidencial' o 'Secreto' hasta que se haya inicializado la clave criptográfica del inquilino. El validador de la API aplica esta regla en el servidor.",
          step2Title: "2. Rotación de claves sin tiempo de inactividad",
          step2Content:
            "La rotación de una clave genera la versión N+1 para nuevas escrituras mientras que la versión N permanece habilitada en el llavero. Los registros históricos se leen de forma instantánea.",
          step3Title: "3. Reempaquetado no bloqueante en base de datos",
          step3Content:
            "Un worker en segundo plano (`TenantKeyRewrapJob`) analiza los registros en lotes paginados por cursor, descifra utilizando claves históricas y vuelve a cifrar con la versión activa N+1.",
          step4Title: "4. Registro de auditoría criptográfica",
          step4Content:
            "Cada evento de creación, rotación, revocación de clave y revelación individual de valor de campo se registra de forma inmutable con la identidad del actor, la dirección IP y la marca de tiempo.",
          rewrapTitle: "Motor de migración y reempaquetado en vivo",
          rewrapIntro:
            "Los conjuntos de datos empresariales a gran escala requieren la migración de claves sin interrupciones del servicio ni bloqueos de tablas:",
          thStrategy: "Estrategia operativa",
          thBehavior: "Implementación del motor",
          stratLocking: "Cero bloqueos de tabla",
          behLocking:
            "Utiliza paginación por cursor y concurrencia optimista (`RowVersion`) para actualizar filas individuales sin bloqueos de tabla exclusivos.",
          stratBatching: "Lotes por cursor configurables",
          behBatching:
            "Procesa 500 registros por iteración de bucle, regulando la ejecución para evitar la saturación de E/S en instancias de base de datos de producción.",
          stratResilience: "Resistente a fallos e idempotente",
          behResilience:
            "Si el proceso se reinicia, el cursor se reanuda desde el último desplazamiento completado. Los registros ya migrados se omiten de forma segura.",
          stratObservability: "Métricas y progreso en tiempo real",
          behObservability:
            "Informa el recuento de procesados, fallos, rendimiento y porcentaje de finalización al panel de Studio y al portal de administración.",
          stratCluster: "Reencapsulamiento de clúster de plataforma",
          behCluster:
            "Migración iniciada por SuperAdmin que reencapsula los secretos de todos los inquilinos bajo la nueva clave de plataforma y actualiza valores sin tiempo de inactividad.",
          toolingTitle: "Interfaces de gestión",
          toolingIntro:
            "Los operadores y desarrolladores cuentan con tres interfaces complementarias para administrar el cifrado:",
          toolPortal:
            "Portal de seguridad del inquilino: interfaz web en `/custom-fields/security` para rotación en autoservicio y supervisión del reempaquetado.",
          toolCli:
            "SCRIPE CLI: conjunto completo de herramientas de terminal mediante `scripe crypto status`, `rotate`, `rewrap`, `verify` y `revoke`.",
          toolStudio:
            "SCRIPE Studio: panel interactivo visual en `/crypto` con tablas de llaveros y barras de progreso de migración en vivo.",
        },
      },
    },
  },
};
