import * as anchor from '@project-serum/anchor'
import { web3 } from '@project-serum/anchor'
import {
  programId,
  SPLING_TOKEN_ACCOUNT_RECEIVER,
  SPLING_TOKEN_ADDRESS,
} from '../../utils/constants'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { SocialIDL } from '../../utils/idl'

/**
 * Join group with the given group id.
 *
 * @category Group
 *
 * @param {number} groupId - the id of the group.
 *
 * @returns A promise that resolves when the user has joined the group.
 */
export default async function joinGroup(groupId: number): Promise<void> {
  try {
    // Find spling pda.
    const [SplingPDA] = web3.PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode('spling')],
      programId,
    )

    // Find the user profile pda.
    const [UserProfilePDA] = web3.PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode('user_profile'), this.wallet.publicKey.toBuffer()],
      programId,
    )

    // Find bank pda.
    const [BankPDA] = web3.PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode('b')],
      programId,
    )

    // Send user join group to the anchor program.
    const transactionCosts = this.tokenAccount !== null ? new anchor.BN(10000) : null

    const program = await submitJoinGroupToAnchorProgram({
      anchorProgram: this.anchorProgram,
      walletPublicKey: this.wallet.publicKey,
      groupId,
      senderTokenAccount: this.tokenAccount,
      SplingPDA,
      UserProfilePDA,
      BankPDA,
      transactionCosts,
    })

    await program.rpc()

    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  }
}

// Submit the user profile to the anchor program.
export async function submitJoinGroupToAnchorProgram(data: {
  anchorProgram: anchor.Program<SocialIDL>
  walletPublicKey: web3.PublicKey
  groupId: number
  senderTokenAccount: web3.PublicKey
  SplingPDA: web3.PublicKey
  UserProfilePDA: web3.PublicKey
  BankPDA: web3.PublicKey
  transactionCosts: any
}) {
  return data.anchorProgram.methods.joinGroup(data.groupId, data.transactionCosts).accounts({
    user: data.walletPublicKey,
    userProfile: data.UserProfilePDA,
    spling: data.SplingPDA,
    b: data.BankPDA,
    receiver: data.walletPublicKey,
    senderTokenAccount:
      data.senderTokenAccount ?? new PublicKey('2cDKYNjMNcDCxxxF7rauq8DgvNXD9r9BVLzKShPrJGUw'),
    receiverTokenAccount: SPLING_TOKEN_ACCOUNT_RECEIVER,
    mint: SPLING_TOKEN_ADDRESS,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
}
