import { submitJoinGroupToAnchorProgram } from '../group/join-group'
import { FileData, FileUriData, User } from './../../types/index'
import { normalizeUser, prepareUser, submitUserProfileToAnchorProgram } from './create-user'

/**
 * Creates a user and join in group with the given parameters.
 *
 * @category User
 *
 * @returns {Promise<User>} A promise that resolves to the newly created user.
 */
export default async function createUserAndJoinGroup({
  user: userData,
  groupId,
}: CreateGroupAndJoinGroupInput): Promise<User> {
  try {
    const {
      account,
      SplingPDA,
      UserProfilePDA,
      BankPDA,
      transactionCosts,
      userProfileJson,
      metadataObject,
    } = await prepareUser(userData.nickname, userData.avatar, userData.biography, userData.metadata)

    const userProgram = await submitUserProfileToAnchorProgram(
      this.anchorProgram,
      this.wallet.publicKey,
      account.publicKey,
      this.tokenAccount,
      SplingPDA,
      UserProfilePDA,
      BankPDA,
      transactionCosts,
    )

    const userProgramInstruction = await userProgram.instruction()

    const user = await normalizeUser(
      UserProfilePDA,
      account,
      userData.nickname,
      userData.avatar,
      userData.biography,
      metadataObject,
      userProfileJson,
    )

    const joinGroupProgram = await submitJoinGroupToAnchorProgram({
      anchorProgram: this.anchorProgram,
      walletPublicKey: this.wallet.publicKey,
      groupId,
      senderTokenAccount: this.tokenAccount,
      SplingPDA,
      UserProfilePDA,
      BankPDA,
      transactionCosts,
    })

    const joinGroupProgramInstruction = await joinGroupProgram.instruction()

    await joinGroupProgram.postInstructions([userProgramInstruction, joinGroupProgramInstruction]).rpc()

    return user
  } catch (error) {
    return Promise.reject(error)
  }
}

//
// Utils
//

export type CreateGroupAndJoinGroupInput = {
  user: {
    nickname: string
    avatar: FileData | FileUriData | null
    biography: string | null
    metadata: any | null
  }
  groupId: number
}
