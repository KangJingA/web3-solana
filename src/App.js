import { useEffect, useState } from "react"
import twitterLogo from "./assets/twitter-logo.svg"
import "./App.css"

// Change this up to be your Twitter if you want.
const TWITTER_HANDLE = "_buildspace"
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`
const TEST_GIFS = [
	"https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp",
	"https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g",
	"https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g",
	"https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp",
  "https://butt-berry.tumblr.com/post/70638927890"
]

const App = () => {
	// State
	const [walletAddress, setWalletAddress] = useState(null)
	const [inputValue, setInputValue] = useState("")
  const [gifList, setGifList] = useState([]);

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

					// set wallet address to be used later
					setWalletAddress(response.publicKey.toString())
				}
			} else {
				alert("Solana object not found! Get a Phantom Wallet 👻")
			}
		} catch (error) {
			console.error(error)
		}
	}

	const connectWallet = async () => {
		const { solana } = window

		if (solana) {
			const response = await solana.connect()
			console.log("Connected with Public Key:", response.publicKey.toString())
			setWalletAddress(response.publicKey.toString())
		}
	}

	/*
	 * We want to render this UI when the user hasn't connected
	 * their wallet to our app yet.
	 */
	const renderNotConnectedContainer = () => (
		<button
			className="cta-button connect-wallet-button"
			onClick={connectWallet}
		>
			Connect to Wallet
		</button>
	)

	const renderConnectedContainer = () => (
		<div className="connected-container">
			<input
				type="text"
				placeholder="Enter gif link!"
				value={inputValue}
				onChange={onInputChange}
			/>
			<button className="cta-button submit-gif-button" onClick={onSubmit}>
				Submit
			</button>
			<div className="gif-grid">
				{gifList.map((gif) => (
					<div className="gif-item" key={gif}>
						<img src={gif} alt={gif} />
					</div>
				))}
			</div>
		</div>
	)

	const onInputChange = (event) => {
		const { value } = event.target
		setInputValue(value)
	}

	const onSubmit = async () => {
		if (inputValue.length > 0) {
			console.log("Gif link:", inputValue)
		} else {
			console.log("Empty input. Try again.")
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

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...');
      
      // Call Solana program here.
  
      // Set state
      setGifList(TEST_GIFS);
    }
  }, [walletAddress]);

	return (
		<div className="App">
			<div className={walletAddress ? "authed-container" : "container"}>
				<div className="header-container">
					<p className="header">🖼 GIF Portal</p>
					<p className="sub-text">
						View your GIF collection in the metaverse ✨
					</p>
					{!walletAddress && renderNotConnectedContainer()}
					{walletAddress && renderConnectedContainer()}
				</div>
				<div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>
						{`built on @${TWITTER_HANDLE}`}
					</a>
				</div>
			</div>
		</div>
	)
}

export default App
