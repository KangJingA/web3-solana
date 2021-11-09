// test script
const anchor = require("@project-serum/anchor")
const { SystemProgram } = anchor.web3

const main = async () => {
	console.log("🚀 Starting test...")

	// get provider from solana config get
	const provider = anchor.Provider.env()
	anchor.setProvider(provider)

	const program = anchor.workspace.Myepicproject

	// Create an account keypair for our program to use.
	const baseAccount = anchor.web3.Keypair.generate()

	// Call start_stuff_off, pass it the params it needs!
	// func is called start_stuff_off in rust
	// but StartStuffOff in JS
	// best practice
	let tx = await program.rpc.startStuffOff({
		accounts: {
			baseAccount: baseAccount.publicKey,
			user: provider.wallet.publicKey,
			systemProgram: SystemProgram.programId,
		},
		signers: [baseAccount],
	})

	console.log("📝 Your transaction signature", tx)

	// Fetch data from the account.
	let account = await program.account.baseAccount.fetch(baseAccount.publicKey)
	console.log("👀 GIF Count", account.totalGifs.toString())

	// Call add_gif!
	await program.rpc.addGif("insert_a_giphy_link_here", "whale hello there", {
		accounts: {
			baseAccount: baseAccount.publicKey,
		},
	})

	// Get the account again to see what changed.
	account = await program.account.baseAccount.fetch(baseAccount.publicKey)
	console.log("👀 GIF Count", account.totalGifs.toString())

	// Access gif_list on the account!
	console.log("👀 GIF List", account.gifList)
}

// to get async run
const runMain = async () => {
	try {
		await main()
		process.exit(0)
	} catch (error) {
		console.error(error)
		process.exit(1)
	}
}

runMain()
