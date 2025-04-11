  } catch (error: unknown) {
    console.error("Error in analyze-screen API:", error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }

  } catch (error: unknown) {
    console.error("Login API error:", error);
     const errorMessage = error instanceof Error ? error.message : 'Internal Server Error during login';
     if (error instanceof SyntaxError) {
         return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
     }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
  
  } catch (error: unknown) {
    console.error("Signup API error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error during signup';
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } 