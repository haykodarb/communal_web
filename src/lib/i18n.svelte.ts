export type Locale = 'en' | 'es';

const STORAGE_KEY = 'communal-locale';

// English strings that are not the same as their lookup key (i.e. landing copy).
const en: Record<string, string> = {
	'form-invalid-email': 'Please enter a valid email',
	'form-short-password': 'Password must be at least 6 characters',
	'form-short-username': 'Username must be at least 3 characters',
	'form-min-length': 'Must be at least {n} characters long.',
	'community-books-no-items': 'No books found in this community.',
	'community-members-no-items':
		'No members found in this community.\n\nThis is likely an internet error or a bug with the app.',
	'community-topics-no-items': 'No topics have been created in this community.'
};

const es: Record<string, string> = {
	Login: 'Ingresar',
	Register: 'Registrarse',
	'Sign in': 'Iniciar sesión',
	'Create account': 'Crear cuenta',
	'Forgot password?': '¿Olvidaste tu contraseña?',
	'Resend confirmation': 'Reenviar confirmación',
	Email: 'Email',
	Username: 'Usuario',
	Password: 'Contraseña',
	'Enter with Google': 'Entrar con Google',
	'My Books': 'Mis Libros',
	Communities: 'Comunidades',
	Logout: 'Salir',
	'Change language': 'Cambiar idioma',
	'Toggle theme': 'Cambiar tema',
	'Recover password': 'Reestablecer contraseña',
	Submit: 'Enviar',
	Next: 'Siguiente',
	'form-invalid-email': 'Ingresá un email válido',
	'form-short-password': 'La contraseña debe tener al menos 6 caracteres',
	'form-short-username': 'El usuario debe tener al menos 3 caracteres',
	'A confirmation link has been sent to:': 'Se envió un link de confirmación a:',
	'Please validate your email and then login.':
		'Por favor validá tu email y luego iniciá sesión.',
	Loans: 'Préstamos',
	Messages: 'Mensajes',
	Notifications: 'Notificaciones',
	Profile: 'Perfil',
	'My Profile': 'Mi Perfil',
	Admin: 'Admin',
	member: 'miembro',
	Loaned: 'Prestado',
	'Borrowed from': 'Recibido de',
	'Loaned to': 'Prestado a',
	Pending: 'Pendiente',
	Accepted: 'Aceptado',
	Rejected: 'Rechazado',
	Returned: 'Devuelto',
	'No books found in your library.': 'No tenés libros en tu biblioteca.',
	'You can upload some with the floating button on the bottom right.':
		'Podés subir algunos usando el botón flotante abajo a la derecha.',
	'You are not a member of any communities.': 'No sos miembro de ninguna comunidad.',
	'You can create your own or request an invite from the admins of other communities.':
		'Podés crear la tuya o pedir una invitación a los admins de otras comunidades.',
	'No loans found.': 'No se encontraron préstamos.',
	'No messages yet.': 'Aún no hay mensajes.',
	'No notifications yet.': 'Aún no hay notificaciones.',
	'Profile not found.': 'Perfil no encontrado.',
	Search: 'Buscar',
	Filter: 'Filtrar',
	Menu: 'Menú',
	Close: 'Cerrar',
	Back: 'Volver',
	Pin: 'Fijar',
	Available: 'Disponible',
	Owner: 'Dueño',
	Loanee: 'Solicitante',
	'Loan completed': 'Préstamo completado',
	'Loan accepted': 'Préstamo aceptado',
	'Loan rejected': 'Préstamo rechazado',
	'Awaiting approval': 'Esperando aprobación',
	Approved: 'Aceptado',
	Requested: 'Solicitado',
	'Add book': 'Agregar libro',
	'Create community': 'Crear comunidad',
	'This form has not been ported yet.': 'Este formulario aún no fue portado.',
	'No communities found.': 'No se encontraron comunidades.',
	'Book not found.': 'Libro no encontrado.',
	'Community not found.': 'Comunidad no encontrada.',
	'Loan not found.': 'Préstamo no encontrado.',
	'Edit profile': 'Editar perfil',
	'About me': 'Sobre mí',
	Books: 'Libros',
	Reviews: 'Reseñas',
	'You have not uploaded any books.':
		'No subiste ningún libro.\n\nPodés empezar desde la página "Mis Libros".',
	'You have not reviewed any books yet.':
		'Aún no reseñaste ningún libro.\n\nPodés dejar reseñas en los libros que recibís de otras personas.',
	'form-min-length': 'Debe tener al menos {n} caracteres.',
	'Please enter something': 'Por favor ingresar algo',
	'Please add a book cover image.': 'Por favor agregá una imagen de portada.',
	'Add\nimage': 'Agregar\nimagen',
	Title: 'Título',
	Author: 'Autor',
	'Review (Optional)': 'Reseña (Opcional)',
	'Publicly visible?': '¿Públicamente visible?',
	Add: 'Agregar',
	Save: 'Guardar',
	Edit: 'Editar',
	Delete: 'Borrar',
	'Edit book': 'Editar libro',
	'Delete book?': '¿Borrar libro?',
	Yes: 'Sí',
	No: 'No',
	Added: 'Agregado',
	Visibility: 'Visibilidad',
	Public: 'Público',
	Private: 'Privado',
	Status: 'Estado',
	'View loan': 'Ver préstamo',
	'No reviews': 'Sin reseñas',
	Name: 'Nombre',
	'Description (Optional)': 'Descripción (Opcional)',
	Create: 'Crear',
	Theme: 'Tema',
	Language: 'Idioma',
	'Show email?': '¿Mostrar email?',
	'Bio (Optional)': 'Bio (Opcional)',
	'Username must be at least 6 characters long': 'El usuario debe tener al menos 6 caracteres',
	'Username must be at most 20 characters long': 'El usuario debe tener como máximo 20 caracteres',
	'Username should only include ASCII characters':
		'El usuario solo puede incluir caracteres ASCII',
	'Username is already taken.': 'El usuario ya está en uso.',
	'Bio must be at least 20 characters long': 'La bio debe tener al menos 20 caracteres',
	Book: 'Libro',
	Loan: 'Préstamo',
	Request: 'Solicitar',
	Unavailable: 'No disponible',
	'Request loan for this book?': '¿Solicitar préstamo de este libro?',
	'Withdraw request': 'Retirar solicitud',
	'Withdraw your request for this book?': '¿Retirar tu solicitud de este libro?',
	'Request status': 'Estado de la solicitud',
	'requested this book': 'solicitó este libro',
	'You requested this book from': 'Solicitaste este libro a',
	'Mark as returned': 'Marcar como devuelto',
	'Mark this book as returned?': '¿Marcar este libro como devuelto?',
	Approve: 'Aceptar',
	Reject: 'Rechazar',
	'Accept this loan?': '¿Aceptar este préstamo?',
	'Reject this loan?': '¿Rechazar este préstamo?',
	'Review by': 'Reseña por',
	'Write a review...': 'Escribir una reseña...',
	Cancel: 'Cancelar',
	'Your review': 'Tu reseña',
	'Add review': 'Agregar reseña',
	'Edit review': 'Editar reseña',
	'Add friend': 'Agregar amigo',
	Friends: 'Amigos',
	'Add {name} as friend?': '¿Agregar a {name} como amigo?',
	'Remove {name} as friend?': '¿Eliminar a {name} de tus amigos?',
	'Withdraw friend request?': '¿Retirar solicitud de amistad?',
	'No books found.': 'No se encontraron libros.',
	Accept: 'Aceptar',
	New: 'Nuevas',
	Today: 'Hoy',
	'Accept this request?': '¿Aceptar esta solicitud?',
	'Reject this request?': '¿Rechazar esta solicitud?',
	'Your request for ': 'Tu solicitud por ',
	'A request has been submitted for ': 'Ingresó una solicitud por ',
	'Your loan for ': 'Tu préstamo de ',
	' has been accepted by ': ' fue aceptada por ',
	' has been rejected by ': ' fue rechazada por ',
	' by ': ' de parte de ',
	' has been marked as returned by ': ' fue marcado como devuelto por ',
	' sent you a friend request.': ' te envió una solicitud de amistad.',
	'You became friends with ': 'Ahora sos amigo de ',
	'You have been invited to join ': 'Te invitaron a unirte a ',
	'You have joined community ': 'Te uniste a la comunidad ',
	'Unknown notification type:': 'Tipo de notificación desconocido:',
	'Show password': 'Mostrar contraseña',
	'Hide password': 'Ocultar contraseña',
	Send: 'Enviar',
	'Reset password': 'Reestablecer contraseña',
	'Confirmation email resent. Please check your inbox.':
		'Se reenvió el email de confirmación. Revisá tu bandeja de entrada.',
	'Server error. Could not resend confirmation email.':
		'Error del servidor. No se pudo reenviar el email de confirmación.',
	'Password must be at least 6 characters long': 'La contraseña debe tener al menos 6 caracteres',
	'Password should only include ASCII characters':
		'La contraseña solo puede incluir caracteres ASCII',
	'Password updated succesfully, you can now login with your new password.':
		'Contraseña actualizada, ya podés ingresar con tu nueva contraseña.',
	'Please request a new password reset and follow the link in your email.':
		'Pedí un nuevo reestablecimiento de contraseña y seguí el link de tu email.',
	'Wrong link. Please re-request a password reset.':
		'Link inválido. Pedí un nuevo reestablecimiento de contraseña.',
	'Delete chat?': '¿Borrar chat?',
	Seen: 'Visto',
	'Type something...': 'Escribí algo...',
	'Could not send message, likely network error.':
		'No se pudo enviar el mensaje, probablemente un error de red.',
	Discuss: 'Conversar',
	Members: 'Miembros',
	Settings: 'Configuración',
	'Create topic': 'Crear conversación',
	'Invite user': 'Invitar usuario',
	Invite: 'Invitar',
	Undo: 'Deshacer',
	you: 'tú',
	More: 'Más',
	'Make admin': 'Hacer admin',
	'Remove admin': 'Quitar admin',
	Kick: 'Echar',
	'request pending': 'solicitud pendiente',
	'requests pending': 'solicitudes pendientes',
	'community-books-no-items': 'No se encontraron libros en esta comunidad.',
	'community-members-no-items':
		'No se encontraron usuarios en esta comunidad.\nEsto es probablemente un error de conexión o un bug.',
	'community-topics-no-items': 'No se crearon conversaciones en esta comunidad.',
	Leave: 'Salir',
	Requests: 'Solicitudes',
	'No pending requests.': 'No hay solicitudes pendientes.',
	'Accept membership request?': '¿Aceptar solicitud de membresía?',
	'Reject membership request?': '¿Rechazar solicitud de membresía?',
	'Confirm delete of community {name}?': '¿Confirmás borrar la comunidad {name}?',
	'Are you sure you want to leave community {name}?':
		'¿Seguro que querés salir de la comunidad {name}?',
	'Undo invitation to {name}?': '¿Deshacer la invitación a {name}?',
	'Error in inviting user.': 'Error al invitar al usuario.',
	'Error in rescinding invitation.': 'Error al deshacer la invitación.',
	Users: 'Usuarios',
	'No books found in any of the communities you are a part of.':
		'No se encontraron libros en ninguna de tus comunidades.',
	'No users found, likely a network issue.':
		'No se encontraron usuarios, probablemente un error de red.',
	Previous: 'Anterior',
	'No books.': 'Sin libros.',
	'No reviews.': 'Sin reseñas.',
	'Created this topic': 'Creó esta conversación',
	'Order by': 'Ordenar por',
	'Filter by': 'Filtrar por',
	'Filter by status': 'Filtrar por estado',
	'Filter by book ownership': 'Filtrar por propiedad',
	Date: 'Fecha',
	All: 'Todos',
	Completed: 'Completado',
	Own: 'Propio',
	Foreign: 'Ajeno',
	'This page does not exist.': 'Esta página no existe.',
	'Try again': 'Reintentar',
	'Go to the home page': 'Ir a la página de inicio',
	// Landing page (/home)
	"Log in": "Ingresar",
	"Open Communal": "Abrir Communal",
	"Share books with your communities.": "Compartí libros con tus comunidades.",
	"Connect with your peers and upload your physical collection to contribute to a decentralized library, shared among the circles you're connected with.": "Conectate con tus pares y subí tu colección física para sumar a una biblioteca descentralizada, compartida entre los círculos con los que estás conectado.",
	"Create an account": "Crear una cuenta",
	"Get the Android app": "Descargar la app para Android",
	"Your community grows with your friends": "Tu comunidad crece con tus amigos",
	"Your community is made of your friends and the people they know. Every book in it is one or two introductions away.": "Tu comunidad está formada por tus amigos y la gente que ellos conocen. Cada libro está a una o dos presentaciones de distancia.",
	"You": "Vos",
	"Your shelf, open to your community.": "Tu biblioteca, abierta a tu comunidad.",
	"The people you add, and their collections.": "La gente que agregás, y sus colecciones.",
	"Friends of friends": "Amigos de amigos",
	"Your friends' friends are part of your community too.": "Los amigos de tus amigos también son parte de tu comunidad.",
	"Your community stops there, so it stays close to you. You can also keep your shelf among direct friends.": "Tu comunidad termina ahí, así se mantiene cerca tuyo. También podés dejar tu biblioteca solo entre amigos directos.",
	"You, your friends around you, and their friends around them.": "Vos, tus amigos a tu alrededor, y los amigos de ellos alrededor suyo.",
	"From shelf to shelf": "De biblioteca en biblioteca",
	"Find a book you've been dying to read and ask its owner to loan it out.": "Encontrá ese libro que te morís por leer y pedile al dueño que te lo preste.",
	"Once they agree, arrange the handover through messages.": "Cuando acepte, coordinen la entrega por mensajes.",
	"Return": "Devolver",
	"Bring it back when you're done and share what you thought of it.": "Devolvelo cuando termines y contá qué te pareció.",
	"Open your shelf": "Abrí tu biblioteca",
	"Showcase your book collection to your peers. Give each book a new purpose by lending it out, building shared stories along the way.": "Mostrale tu colección de libros a tus pares. Dale a cada libro un nuevo propósito prestándolo, y construí historias compartidas en el camino.",
	"Borrow books": "Pedí libros prestados",
	"One of your friends has a book on their shelf that you've been dying to read? It's already in your community: ask if you can loan it out for a bit.": "¿Uno de tus amigos tiene en su biblioteca un libro que te morís por leer? Ya está en tu comunidad: preguntale si te lo presta un tiempo.",
	"Exchange ideas": "Intercambiá ideas",
	"Review the books you've read and discuss them with your friends. Share your insights and perspectives with like-minded people.": "Reseñá los libros que leíste y charlalos con tus amigos. Compartí tus ideas y perspectivas con gente afín.",
	"Give your books a new purpose.": "Dale a tus libros un nuevo propósito.",
	"Designed by": "Diseñado por",
	"Developed by": "Desarrollado por",
	"Privacy policy": "Política de privacidad",
	Received: 'Recibidas',
	Sent: 'Enviadas',
	Remove: 'Eliminar',
	Withdraw: 'Retirar',
	'You have no friends yet. Find people in Search.':
		'Todavía no tenés amigos. Buscá personas en Buscar.',
	'You have not sent any requests.': 'No enviaste ninguna solicitud.',
	'via {name}': 'vía {name}',
	'and {n} more': 'y {n} más',
	'No books found among your friends and their friends.':
		'No se encontraron libros entre tus amigos y sus amigos.',
	'Notify me when available': 'Avisarme cuando esté disponible',
	'Stop notifying me': 'Dejar de avisarme',
	' is available again.': ' está disponible de nuevo.',
	Message: 'Mensaje',
	'Show my books to friends of friends': 'Mostrar mis libros a amigos de amigos',
	'Account settings': 'Configuración de la cuenta',
	'Please enter a valid email': 'Ingresá un email válido',
	'New email': 'Nuevo email',
	'Change email': 'Cambiar email',
	'Check your inbox: we sent a confirmation link to {email}.':
		'Revisá tu bandeja de entrada: enviamos un link de confirmación a {email}.',
	'Waiting for confirmation of {email}.': 'Esperando la confirmación de {email}.',
	'New password': 'Nueva contraseña',
	'Repeat password': 'Repetir contraseña',
	'Change password': 'Cambiar contraseña',
	'Passwords do not match': 'Las contraseñas no coinciden',
	'Password updated.': 'Contraseña actualizada.',
	'Delete account': 'Borrar cuenta',
	'This deletes your profile, books, loans, messages and friendships. It cannot be undone.':
		'Esto borra tu perfil, libros, préstamos, mensajes y amistades. No se puede deshacer.',
	'Are you sure you want to delete your account? This is immediate and cannot be undone.':
		'¿Seguro que querés borrar tu cuenta? Es inmediato y no se puede deshacer.'
};

function readInitial(): Locale {
	if (typeof localStorage !== 'undefined') {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === 'en' || stored === 'es') return stored;
	}
	return 'en';
}

let locale = $state<Locale>(readInitial());

function apply(next: Locale): void {
	if (typeof document !== 'undefined') {
		document.documentElement.lang = next;
	}
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, next);
	}
}

/** Translate a key. English keys fall back to themselves, matching the app. */
export function t(key: string): string {
	const dict = locale === 'es' ? es : en;
	return dict[key] ?? key;
}

export const i18n = {
	get locale(): Locale {
		return locale;
	},
	set(next: Locale): void {
		locale = next;
		apply(next);
	},
	toggle(): void {
		const next: Locale = locale === 'en' ? 'es' : 'en';
		locale = next;
		apply(next);
	}
};
