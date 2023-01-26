var DB_ENC = require('simple-encryptor')(process.env.ENCR_KEY_DB),
	API_ENC = require('simple-encryptor')(process.env.ENCR_API_KEY);

module.exports = {
	initial_value:{
		name:API_ENC.decrypt('4064fc8f4020917642b01e34e5ba36b6a45dd90e37fd9f0dfb8fb353a4e31bc1e970d9c0cd50c25ad289452653431517fhqVBWfpLREwpKQV0Mq88D2EueqVG2nEzoTPV3oihNc='),
		access:API_ENC.decrypt('dc7bece1d0fd68562734dee761344fbb62a8e5da7e6dee7782682a02c7c2ca41f2099929fe2dcba983d48beaa3e6e640s6s8NPVjpqC4Mpa5v7wxvA=='),
		email:API_ENC.decrypt('4064fc8f4020917642b01e34e5ba36b6a45dd90e37fd9f0dfb8fb353a4e31bc1e970d9c0cd50c25ad289452653431517fhqVBWfpLREwpKQV0Mq88D2EueqVG2nEzoTPV3oihNc='),
		secret:API_ENC.decrypt('c6e320171caf87051980479497505d789ee6c5752bee039317bb812ef8f57b2229d5797018cc0a4b06b6a3e4d1cea331A2fsEJnzGurfNRBjjYab2A=='),
		permission:[0,1,2,3,4,5,6,7,8,9,10,11,12]
	},

	local_db:{
		host:DB_ENC.decrypt('39f2ae10eb6d7e8f2fd31cb4c615d7192d48005f409529b3de0eb0a59af34dc43f9eeb7bf26d26738f68134a1521e1beZOTbuLq+d5cAletvGGMZAg=='),
		port:DB_ENC.decrypt('ba27ea7d351f9ba4a3343792e78d3f569dab61166fdd338c84c6118026f83108e74cc832013f584ebcdfab23899f2a45cskCFodwAaTH5AmxTZq/mg=='),
		name:DB_ENC.decrypt('ef09d0f48c2b42c17116d5eb9776217789d1723fe6b536e923124238e09f1104ee7fe7b0c573de815bd761330ac1b680Fs10cWHGjtPeqpa1WSEgaA==')
	},

	demo_db:{
		user:DB_ENC.decrypt('81c904d32bae4b21799bfe93edf01ba007f478c6235f7319e0ea22abd811df46d0e6626912ec0a0849d83cda235ca9afaQiRFML2kNFUp0d6CDwj2PgjreTFE7ypgi4+uUCFUG0='),
		pass:DB_ENC.decrypt('1a9f017771fc227afb4ee5376880bd67c12b066d519d40ce9cc78ce77a91fbf6b7dc9cd4d914ffbd5f33a818cceb0001jGH9JjaW8bepLrT3JbdY+uO426g4eo0eob9egG9scBE='),
		host:DB_ENC.decrypt('900883e8911a52d95011c56ed60642282d28ee488186201e6ffe2ffb2f99c46bb236797af201c707c15b19cbae7c9ac4FxfE2/x5FssCeZmSxRW3Bg=='),
		port:DB_ENC.decrypt('d58413566618f1bc11c00e5738c5e368daf91e183cf274de63c8bbb48ec795f7fb6be6e169c805586e1b0921c14684daAy+52o7yO5ChXv7dR4NaKQ=='),
		name:DB_ENC.decrypt('eb9d4b3d5a1f72f17e79abcf80b82ef661d7d3b225bf761e93ccc400d4ee0bf9af077397f728a51a403f4a2229e7e6c6EDz68EuoJ6sOxYf1IaohWcDSC2s4UHEYUeowC8Ohe6k=')
	}
}