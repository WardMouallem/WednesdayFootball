import { supabase } from '../lib/supabase';

export const gameService = {
  // Get current game with registrations
  async getCurrentGame() {
    const { data: games, error } = await supabase
      .from('games')
      .select(`
        *,
        registrations (
          *,
          players (
            *,
            users (*)
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    return games[0] || null;
  },

  // Register a player for the current game
  async registerPlayer(playerData, isSelfRegistered = false) {
    // Get or create current game
    let game = await this.getCurrentGame();
    if (!game) {
      const { data: newGame, error: gameError } = await supabase
        .from('games')
        .insert([{ game_date: new Date(), status: 'scheduled' }])
        .select()
        .single();
      if (gameError) throw gameError;
      game = newGame;
    }

    // Check if player exists (by phone or name)
    let player;
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('*')
      .or(`name.eq.${playerData.name},phoneNumber.eq.${playerData.phoneNumber}`)
      .single();

    if (existingPlayer) {
      player = existingPlayer;
    } else {
      // Create new player (guest or registered user)
      const { data: newPlayer, error: playerError } = await supabase
        .from('players')
        .insert([{
          name: playerData.name,
          phoneNumber: playerData.phoneNumber,
          user_id: playerData.userId || null
        }])
        .select()
        .single();
      if (playerError) throw playerError;
      player = newPlayer;
    }

    // Create registration
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert([{
        game_id: game.id,
        player_id: player.id,
        registered_by: playerData.registeredBy,
        status: 'confirmed',
        is_self_registered: isSelfRegistered
      }])
      .select(`
        *,
        players (*)
      `)
      .single();

    if (regError) throw regError;
    return registration;
  },

  // Get registration count for current game
  async getRegistrationCount() {
    const game = await this.getCurrentGame();
    if (!game) return 0;

    const { count, error } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', game.id)
      .eq('status', 'confirmed');

    if (error) throw error;
    return count;
  },

  // Subscribe to real-time registration updates
  subscribeToRegistrations(callback) {
    return supabase
      .channel('registrations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations'
        },
        callback
      )
      .subscribe();
  }
};
