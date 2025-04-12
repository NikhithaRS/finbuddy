  export async function analyzeScreenHandler() {
    try {
      // Your code logic here
    } catch (error: unknown) {
      console.error("Error in analyze-screen API:", error);
      const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
      return Response.json({ error: errorMessage }, { status: 500 });
    }
  }
  
  export async function loginHandler() {
    try {
      // Your login API logic here
    } catch (error: unknown) {
      console.error("Login API error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Internal Server Error during login';
      if (error instanceof SyntaxError) {
          return Response.json({ error: 'Invalid request body' }, { status: 400 });
      }
      return Response.json({ error: errorMessage }, { status: 500 });
    }
  }
  
  export async function signupHandler() {
    try {
      // Your signup API logic here
    } catch (error: unknown) {
      console.error("Signup API error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Internal Server Error during signup';
      if (error instanceof SyntaxError) {
          return Response.json({ error: 'Invalid request body' }, { status: 400 });
      }
      return Response.json({ error: errorMessage }, { status: 500 });
    }
  }