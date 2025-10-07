import { BrowserRouter } from 'react-router-dom';
import '@/App.css'
import Header from '@components/Header';
import Router from '@/router';

function App() {
	return (
		<BrowserRouter basename="/SilkRoad">
			<Header />
			<Router />
		</BrowserRouter>
	)
}

export default App
