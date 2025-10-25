import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import App from '@/App'

const redirect = sessionStorage.redirect;
if (redirect && redirect !== window.location.pathname) {
	sessionStorage.removeItem("redirect");
	window.history.replaceState(null, "", redirect);
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
)
