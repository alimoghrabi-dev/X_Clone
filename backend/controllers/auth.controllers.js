export async function signupUser(req, res) {
  try {
    return res.status(200).json("Signedup Successfully.");
  } catch (error) {
    console.log(error, "Signup User");
    return res.status(500).json("Internal server error!");
  }
}
