import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import '@/index.css'
import App from '@/App'

const queryClient = new QueryClient();

const redirect = sessionStorage.redirect;
if (redirect && redirect !== window.location.pathname) {
	sessionStorage.removeItem("redirect");
	window.history.replaceState(null, "", redirect);
}

createRoot(document.getElementById('root')!).render(
	<StrictMode> 
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>,
	</StrictMode>,
)
