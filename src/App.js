import { useEffect } from "react"
import twitterLogo from "./assets/twitter-logo.svg"
import "./App.css"

// Change this up to be your Twitter if you want.
const TWITTER_HANDLE = "_buildspace"
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

const App = () => {
	/*
	 * This function holds the logic for deciding if a Phantom Wallet is
	 * connected or not
	 */
	const checkIfWalletIsConnected = async () => {
		try {
			const { solana } = window

			if (solana) {
				// consider using other solana wallets too
				if (solana.isPhantom) {
					console.log("Phantom wallet found!")

					/*
					 * The solana object gives us a function that will allow us to connect
					 * directly with the user's wallet!
					 */
					const response = await solana.connect({ onlyIfTrusted: true })
					console.log(
						"Connected with Public Key:",
						response.publicKey.toString()
					)
				}
			} else {
				alert("Solana object not found! Get a Phantom Wallet 👻")
			}
		} catch (error) {
			console.error(error)
		}
	}

	/*
	 * When our component first mounts, let's check to see if we have a connected
	 * Phantom Wallet
	 */
	useEffect(() => {
		window.addEventListener("load", async (event) => {
			await checkIfWalletIsConnected()
		})
	}, [])

	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<p className="header">🖼 GIF Portal</p>
					<p className="sub-text">
						View your GIF collection in the metaverse ✨
					</p>
				</div>
				<div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built on @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	)
}

export default App
