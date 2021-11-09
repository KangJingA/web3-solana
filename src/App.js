import { useEffect, useState, useCallback } from "react"
import idl from "./idl.json"
import kp from "./keypair.json"
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js"
import { Program, Provider, web3 } from "@project-serum/anchor"
import twitterLogo from "./assets/twitter-logo.svg"
import "./App.css"

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram } = web3

// Create a permanent keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)
console.log("base account", baseAccount)
// Get our program's id form the IDL file.
const programID = new PublicKey(idl.metadata.address)

// Set our network to devent.
const network = clusterApiUrl("devnet")

// Control's how we want to acknowledge when a trasnaction is "done".
const opts = {
	preflightCommitment: "processed",
}

// Change this up to be your Twitter if you want.
const TWITTER_HANDLE = "_buildspace"
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`
// const TEST_GIFS = [
// 	"https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp",
// 	"https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g",
// 	"https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g",
// 	"https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp",
// 	"https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif",
// ]

const TEST_GIFS = [
	{
		gifLink: "https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp",
		gifPun: "boob bloob boob",
	},
	{
		gifLink: "https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif",
		gifPun: "stay pawstive",
	},
]

const App = () => {
	// State
	const [walletAddress, setWalletAddress] = useState(null)
	const [linkValue, setlinkValue] = useState("")
	const [punValue, setPunValue] = useState("")
	const [gifList, setGifList] = useState([])

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

	const renderConnectedContainer = () => {
		// If we hit this, it means the program account hasn't be initialized.
		if (gifList === null) {
			return (
				<div className="connected-container">
					<button
						className="cta-button submit-gif-button"
						onClick={createGifAccount}
					>
						Do One-Time Initialization For GIF Program Account
					</button>
				</div>
			)
		}
		// Otherwise, we're good! Account exists. User can submit GIFs.
		else {
			console.log("gifs: ", gifList)
			return (
				<div className="connected-container">
					<div className="submit-container">
						<input
							className="submit1"
							type="text"
							placeholder="Enter gif link!"
							value={linkValue}
							onChange={onLinkInputChange}
						/>
						<input
							className="submit2"
							type="text"
							placeholder="Insert pun here!"
							value={punValue}
							onChange={onPunInputChange}
						/>
						<button className="cta-button submit-gif-button submit3" onClick={sendGif}>
							Submit
						</button>
					</div>

					<div className="gif-grid">
						{/* We use index as the key instead, also, the src is now item.gifLink */}
						{gifList.map((item, index) => (
							<div className="gif-item" key={index}>
								<img src={item.gifLink} alt="" />
								<p>{item.gifPun}</p>
							</div>
						))}
					</div>
				</div>
			)
		}
	}

	const onLinkInputChange = (event) => {
		const { value } = event.target
		setlinkValue(value)
	}

	const onPunInputChange = (event) =>{
		const {value} =event.target
		setPunValue(value)
	}

	const sendGif = async () => {
		if (linkValue.length === 0) {
			console.log("No gif link given!")
			return
		} 

		if (punValue.length === 0) {
			console.log("No pun given")
		}
		
		console.log("Gif link: ", linkValue)
		console.log("Gif pun: ", punValue)

		try {
			const provider = getProvider()
			const program = new Program(idl, programID, provider)

			await program.rpc.addGif(linkValue, punValue, {
				accounts: {
					baseAccount: baseAccount.publicKey,
				},
			})
			console.log("GIF sucesfully sent to program", linkValue)

			await getGifList()
		} catch (error) {
			console.log("Error sending GIF:", error)
		}
	}
	// create provider, authenticated connection to Solana
	const getProvider = () => {
		const connection = new Connection(network, opts.preflightCommitment)
		const provider = new Provider(
			connection,
			window.solana,
			opts.preflightCommitment
		)
		return provider
	}

	// create program base account
	const createGifAccount = async () => {
		try {
			const provider = getProvider()
			const program = new Program(idl, programID, provider) // connect to Solana account
			console.log("ping")
			await program.rpc.startStuffOff({
				accounts: {
					baseAccount: baseAccount.publicKey,
					user: provider.wallet.publicKey,
					systemProgram: SystemProgram.programId,
				},
				signers: [baseAccount],
			})
			console.log(
				"Created a new BaseAccount w/ address:",
				baseAccount.publicKey.toString()
			)
			await getGifList()
		} catch (error) {
			console.log("Error creating BaseAccount account:", error)
		}
	}

	const getGifList = useCallback(async () => {
		try {
			const provider = getProvider()
			const program = new Program(idl, programID, provider)
			const account = await program.account.baseAccount.fetch(
				baseAccount.publicKey
			)

			setGifList(account.gifList)
		} catch (error) {
			console.log("Error in getGifs: ", error)
			setGifList(null)
		}
	}, [])

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
			console.log("Fetching GIF list...")

			// Call Solana program here.
			getGifList()
		}
	}, [walletAddress, getGifList])

	return (
		<div className="App">
			<div className={walletAddress ? "authed-container" : "container"}>
				<div className="header-container">
					<p className="header">🐋 WHALE HELLO THERE!</p>
					<p className="sub-text">
						View the greatest animal pun collection in the metaverse.
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
